/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { FormGroup, Label, FormText, Input } from 'reactstrap';
import { setNoteSearchTerms, searchNotesByTerms } from '../../../actions/cohort/noteSearch';
import { NoteSearchTerm } from '../../../models/state/CohortState';
import { AiOutlineClose } from 'react-icons/ai';
import './SearchTermEditor.css';

interface Props {
    dispatch: any;
    terms: NoteSearchTerm[];
}

interface State {
    text: string;
}


export class SearchTermEditor extends React.PureComponent<Props,State> {
    private className = 'note-search-term-editor';
    private termColors = ['rgb(168,130,229)', 'rgb(245,175,46)', 'rgb(62,203,215)', 'rgb(231,81,164)', 'rgb(84,209,68)', 'rgb(85,129,209)'];
    private termCreateCount = 0;

    constructor(props: Props) {
        super(props);
        this.state = {
            text: ''
        }
    }

    public render() {
        const { terms } = this.props;
        const { text } = this.state;
        const c = this.className;

        return (
            <FormGroup className={c}>
                <Label>
                    Search Terms
                    <FormText color="muted">Enter terms to look for in notes. Type 'enter', or 'tab' to add a term.</FormText>
                </Label>
                <div className={`${c}-term-container`}>
                {terms.map((t,i) => {
                    return (
                        <div 
                            className={`${c}-term`} 
                            key={i} 
                            onClick={this.handleRemoveTermClick.bind(null,i)}
                            style={{ backgroundColor: t.color.replace(')',',0.1)'), borderColor: t.color }}>
                            {t.text}
                            <span><AiOutlineClose/></span>
                        </div>
                    )
                })}
                </div>
                <Input 
                    className={`${c}-input leaf-input`} 
                    value={text} 
                    onChange={this.handleChange}
                    onKeyDown={this.handleKeydown}
                />
        </FormGroup>
        );
    }

    private handleKeydown = (k: React.KeyboardEvent<HTMLInputElement>) => {
        const { dispatch, terms } = this.props;
        const { text } = this.state;
        const trimmed = text.trim();

        switch (k.key) {
            case 'Tab':
            case 'Enter': {
                if (trimmed.length) {
                    k.preventDefault();
                    const newTerm: NoteSearchTerm = { 
                        color: this.termColors[this.termCreateCount++ % this.termColors.length],
                        text: trimmed
                    };
                    dispatch(setNoteSearchTerms(terms.concat([newTerm])));
                    dispatch(searchNotesByTerms());
                    this.setState({ text: '' });
                }
                return;
            }
            case 'Backspace': {
                if (!trimmed.length && terms.length) {
                    const newTerms = terms.slice();
                    newTerms.pop();
                    dispatch(setNoteSearchTerms(newTerms));
                    dispatch(searchNotesByTerms());
                }
                return;
            }
        }
    }

    private handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.currentTarget.value;
        this.setState({ text: newVal });
    };

    private handleRemoveTermClick = (idx: number) => {
        const { dispatch, terms } = this.props;
        const newTerms = terms.slice();
        newTerms.splice(idx,1);
        dispatch(setNoteSearchTerms(newTerms));
        dispatch(searchNotesByTerms());
    }
};
