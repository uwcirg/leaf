/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { generate as generateId } from 'shortid';
import { Note } from '../../models/cohort/NoteSearch';
import { workerContext } from './noteSearchWebWorkerContext';

const SEARCH = 'SEARCH';
const INDEX = 'INDEX';
const FLUSH = 'FLUSH';

interface InboundMessagePartialPayload {
    message: string;
    notes?: Note[];
    terms?: string[];
}

interface InboundMessagePayload extends InboundMessagePartialPayload {
    requestId: string;
}

interface OutboundMessagePayload {
    requestId: string;
    result?: any;
}

interface WorkerReturnPayload {
    data: OutboundMessagePayload;
}

interface PromiseResolver {
    reject: any;
    resolve: any;
}

interface Indices {
    start: number;
    end: number;
}

interface TokenInstance {
    charIndex: Indices;
    docId: string;
    id: string;
    lexeme: string;
    lineIndex: number;
    index: number;
    nextId?: string;
}

interface TokenPointer {
    instances: TokenInstance[];
    lexeme: string;
    next: Map<string, TokenPointer>;
}

interface SearchHit {
    charIndex: Indices;
    docId: string;
    lineIndex: number;
    searchTerm: string;
}

interface IndexedDocument {
    id: string;
    text: string;
}

interface DocumentSearchResult extends IndexedDocument {
    lines: (TextContext | TextSearchResult)[][]
}

interface DocumentSearchResultContextLine {

}

interface TextSearchResult {
    matchedTerm: string;
    text: string;
    type: 'MATCH';
}

interface TextContext {
    text: string;
    type: 'CONTEXT';
}

export interface SearchResult {
    documents: DocumentSearchResult[];
}

export default class NoteSearchWebWorker {
    private worker: Worker;
    private reject: any;
    private promiseMap: Map<string, PromiseResolver> = new Map();

    constructor() {
        const workerFile = `  
            ${this.addMessageTypesToContext([INDEX, FLUSH, SEARCH])}
            ${workerContext}
            self.onmessage = function(e) {  
                self.postMessage(handleWorkMessage.call(this, e.data, postMessage)); 
            }`;
        // console.log(workerFile);
        // ${this.stripFunctionToContext(this.workerContext)}
        const blob = new Blob([workerFile], { type: 'text/javascript' });
        this.worker = new Worker(URL.createObjectURL(blob));
        this.worker.onmessage = result => this.handleReturnPayload(result);
        this.worker.onerror = error => { console.log(error); this.reject(error) };
    }

    //${this.stripFunctionToContext(this.workerContext)}

    public search = (terms: string[]) => {
        return this.postMessage({ message: SEARCH, terms });
    }

    public index = (notes: Note[]) => {
        return this.postMessage({ message: INDEX, notes });
    }

    public flush = () => {
        return this.postMessage({ message: FLUSH });
    }

    private postMessage = (payload: InboundMessagePartialPayload) => {
        return new Promise((resolve, reject) => {
            const requestId = generateId();
            this.reject = reject;
            this.promiseMap.set(requestId, { resolve, reject });
            this.worker.postMessage({ ...payload, requestId });
        });
    }

    private handleReturnPayload = (payload: WorkerReturnPayload): any => {
        const data = payload.data.result ? payload.data.result : {}
        const resolve = this.promiseMap.get(payload.data.requestId)!.resolve;
        this.promiseMap.delete(payload.data.requestId);
        return resolve(data);
    }

    private stripFunctionToContext = (f: () => any) => {
        const funcString = `${f}`;
        return funcString
            .substring(0, funcString.lastIndexOf('}'))
            .substring(funcString.indexOf('{') + 1)
    }

    private addMessageTypesToContext = (messageTypes: string[]) => {
        return messageTypes.map((v: string) => `var ${v} = '${v}';`).join(' ');
    }

    private workerContext = () => {

        const STOP_WORDS = new Set(['\n','\t','(',')','"',";"]);

        let unigramIndex: Map<string, TokenPointer> = new Map();
        let docIndex: Map<string, IndexedDocument> = new Map();

        console.log('webworker')

        // eslint-disable-next-line
        const handleWorkMessage = (payload: InboundMessagePayload): any => {
            switch (payload.message) {
                case INDEX:
                    return indexDocuments(payload);
                case FLUSH:
                    return flushNotes(payload);
                case SEARCH:
                    return searchNotes(payload);
                default:
                    return null;
            }
        };

        const indexDocuments = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { requestId } = payload;
            const { notes } = payload;

            for (let i = 0; i < notes.length; i++) {
                const note = notes[i];
                const tokens = tokenizeDocument(note);
                const doc: IndexedDocument = { id: note.id, text: note.text };

                let prev: TokenPointer;

                for (let j = 0; j < tokens.length; j++) {
                    const token  = tokens[j];
                    const lexeme = token.lexeme;

                    if (STOP_WORDS.has(lexeme)) continue;

                    if (unigramIndex.has(lexeme)) {
                        unigramIndex.get(lexeme)!.instances.push(token);
                    } else {
                        unigramIndex.set(lexeme, { lexeme, instances: [token], next: new Map() });
                    }

                    if (prev) {
                        if (!prev.next.has(lexeme)) {
                            prev.next.set(lexeme, unigramIndex.get(lexeme));
                        }
                    }
                    prev = unigramIndex.get(lexeme);
                }
                docIndex.set(doc.id, doc);
            }
            console.log(unigramIndex);
            return { requestId };
        }

        const flushNotes = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { requestId } = payload;
            unigramIndex.clear();
            docIndex.clear();
            return { requestId };
        };

        const searchNotes = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { requestId, terms } = payload;

            let precedingHits: Map<string, SearchHit[]> = new Map();

            for (let i = 0; i < terms.length; i++) {
                const termSplit = terms[i].toLocaleLowerCase().split(' ');
                const hits = termSplit.length > 1
                    ? searchMultiterm(termSplit)
                    : searchSingleTerm(termSplit[0]);

                if (!hits.size) return { requestId };

                if (precedingHits.size) {
                    const merged: Map<string, SearchHit[]> = new Map();
                    precedingHits.forEach((v,k) => {
                        if (hits.has(k)) {
                            const both = hits.get(k)!.concat(v);
                            merged.set(k, both);
                        }
                    });
                    precedingHits = merged;
                } else {
                    precedingHits = hits;
                }
            }

            const result: SearchResult = { documents: [] };
            precedingHits.forEach((v,k) => {
                const doc: DocumentSearchResult = { ...docIndex.get(k)!, lines: [] };
                const hits = v.sort((a, b) => a.charIndex.start - b.charIndex.start);
                const context = getSearchResultDocumentContext(doc, hits);
                result.documents.push(context)
                
                console.log(doc.id);
                for (let i = 0; i < v.length; i++) {
                    const match = v[i];
                    console.log(doc.text.substring(match.charIndex.start, match.charIndex.end));
                }
                
            });

            return { requestId, result: result };
        }

        const getSearchResultDocumentContext = (doc: DocumentSearchResult, hits: SearchHit[]): DocumentSearchResult => {
            const contextCharDistance = 30;
            const groups: SearchHit[][] = [];

            // Group by character distance
            for (let i = 0; i < hits.length; i++) {
                const hit = hits[i];
                const group: SearchHit[] = [hit];

                while (true) {
                    let nextIndex = 1;
                    const nextHit = i < hits.length-1 ? hits[i+nextIndex] : undefined;

                    // If overlapping
                    if (nextHit && hit.lineIndex === nextHit.lineIndex && 
                        (hit.charIndex.end + contextCharDistance) >= (nextHit.charIndex.start - contextCharDistance)) {

                        // Merge lines
                        group.push(nextHit);
                        hits.slice(i+nextIndex, 1);
                        nextIndex++;
                    } else {
                        groups.push(group);
                        break;
                    }
                }
            }

            const result: DocumentSearchResult = { ...doc, lines: [] };

            for (let i = 0; i < groups.length; i++) {
                const group = groups[i];
                let line: (TextContext | TextSearchResult)[] = [];
                for (let j = 0; j < group.length; j++) {
                    const backLimit = j > 0 ? group[j-1].charIndex.end : undefined;
                    const forwLimit = j < group.length-1 ? group[j+1].charIndex.start : undefined;
                    const context = getContext(doc, group[j], contextCharDistance, backLimit, forwLimit);
                    line = line.concat(context);
                }
                result.lines.push(line);
            }

            return result;
        };

        const getContext = (doc: DocumentSearchResult, hit: SearchHit, contextCharDistance: number, 
                            backLimit?: number, forwLimit?: number): (TextContext | TextSearchResult)[] => {
            
            const _backLimit = backLimit === undefined ? hit.charIndex.start - contextCharDistance : backLimit;
            const _forwLimit = forwLimit === undefined ? hit.charIndex.end + contextCharDistance : forwLimit;                                
            let backContext = '...' + doc.text.substring(_backLimit, hit.charIndex.start);
            let forwContext = doc.text.substring(hit.charIndex.end, _forwLimit) + '...';

            /*
            let back_i = backContext.length-1;
            while (back_i > -1) {
                if (backContext[back_i] === '\n') {
                    backContext = backContext.substring(back_i, backContext.length-1);
                    break;
                }
                back_i--;
            }
            let forw_i = 1;
            while (forw_i < forwContext.length-1) {
                if (forwContext[forw_i] === '\n') {
                    forwContext = forwContext.substring(0, forw_i);
                    break;
                }
                forw_i++;
            }
            */

            return [
                { type: "CONTEXT", text: backContext },
                { type: "MATCH", text: doc.text.substring(hit.charIndex.start, hit.charIndex.end), matchedTerm: hit.searchTerm },
                { type: "CONTEXT", text: forwContext },
            ];
        };

        const searchSingleTerm = (term: string): Map<string, SearchHit[]> => {
            const result: Map<string, SearchHit[]> = new Map();
            const hit = unigramIndex.get(term);

            if (hit) {
                for (let i = 0; i < hit.instances.length; i++) {
                    const instance = hit.instances[i];
                    if (result.has(instance.docId)) {
                        result.get(instance.docId)!.push({ ...instance, searchTerm: term });
                    } else {
                        result.set(instance.docId, [{ ...instance, searchTerm: term }]);
                    }
                }
            }
            return result;
        };

        const searchMultiterm = (terms: string[]): Map<string, SearchHit[]> => {
            const result: Map<string, SearchHit[]> = new Map();

            // First term
            const term = terms[0];
            const hit = unigramIndex.get(term);

            if (!hit) return result;
            let expected = new Map(hit.instances.filter(t => !!t.nextId).map(t => [t.nextId!, [t]]));
            let next = hit.next;

            // Following
            for (let j = 1; j < terms.length; j++) {
                const term = terms[j];
                const hit = next.get(term);
                if (hit) {
                    let matched = hit.instances.filter(t => expected.has(t.id));
                    if (!matched.length) return result;

                    if (j < terms.length-1) {
                        expected = new Map(matched.filter(t => !!t.nextId).map(t => [t.nextId!, [...expected.get(t.id), t]]));
                        next = hit.next;
                    } else {
                        expected = new Map(matched.map(t => [t.id, [...expected.get(t.id), t]]));
                    }
                }
            }

            expected.forEach((v,k) => {
                const docId = v[0].docId;
                const charIndex = { start: v[0].charIndex.start, end: v[v.length-1].charIndex.end };
                const searchTerm = terms.join(' ');
                const lineIndex = v[0].lineIndex;

                if (result.has(docId)) {
                    result.get(docId)!.push({ docId, charIndex, lineIndex, searchTerm });
                } else {
                    result.set(docId, [{ docId, charIndex, lineIndex, searchTerm }]);
                }
            });

            return result;
        };

        const tokenizeDocument = (note: Note) => {
            const source = note.text.toLocaleLowerCase();
            const tokens: TokenInstance[] = [];
            const spaces = new Set([' ','\n','\t','\r']);
            let line = 0;
            let start = 0;
            let current = 0;

            const scanToken = () => {
                const c = advance();

                switch(c)
                {
                    case ' ':
                    case '\r':
                    case '\t':
                        break;

                    case '\n':
                        toNewLine();
                        break;

                    default:
                        toToken();
                        break;
                }
            };

            const toNewLine = () => {
                line++;
            };

            const toToken = () => {
                while (isAlphaNumeric(peek())) advance();
                addToken();
            };

            const peek = () => {
                if (isAtEnd()) return '\0';
                return source[current];
            };

            const isAlpha = (c: string): Boolean => {
                return (c >= 'a' && c <= 'z') ||
                       (c >= 'A' && c <= 'Z') ||
                       (c === '_' || c === "'");
            };

            const isAlphaNumeric = (c: string) => {
                return isAlpha(c) || isDigit(c);
            };

            const isDigit = (c: string) => {
                return c >= '0' && c <= '9';
            };

            const isAtEnd = () => {
                return current >= source.length;
            };

            const advance = () => {
                return source[current++];
            };

            const addToken = () => {
                const text = source.substring(start, current);
                const token: TokenInstance = { 
                    lexeme: text, 
                    charIndex: { start, end: current }, 
                    docId: note.id, 
                    id: note.id + '_' + tokens.length.toString(),
                    index: tokens.length,
                    lineIndex: line
                };
                if (tokens.length) {
                    const prev = tokens[tokens.length-1];
                    if (prev.lineIndex === token.lineIndex) {
                        tokens[tokens.length-1].nextId = token.id;
                    }
                }
                tokens.push(token);
            };

            while (!isAtEnd()) {
                start = current;
                scanToken();
            }
            return tokens;
        };
    }
}

