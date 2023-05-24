/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import NoteSearchWebWorker, { SearchResult } from '../providers/noteSearch/noteSearchWebWorker';
import { Note } from '../models/cohort/NoteSearch';

const engine = new NoteSearchWebWorker();

export const indexNotes = (notes: Note[]) => {
    return new Promise<void>( async (resolve, reject) => {
        await engine.index(notes);
        resolve();
    });
};

export const flushNotes = () => {
    return new Promise<void>( async (resolve, reject) => {
        await engine.flush();
        resolve();
    });
};

export const searchNotes = (terms: string[]): Promise<SearchResult> => {
    return new Promise( async (resolve, reject) => {
        const results = await engine.search(terms) as SearchResult;
        console.log(results);
        resolve(results);
    });
};
