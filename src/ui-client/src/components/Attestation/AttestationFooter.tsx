/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { createPortal } from 'react-dom';

interface Props { }

interface State {
    backdrop: Element | null;
}

export default class AttestationFooter extends React.PureComponent<Props,State> {
    private className = 'attestation-footer'

    constructor(props: Props) {
        super(props);
        this.state = {
            backdrop: null
        };
    }

    public componentDidMount() {
        this.setBackdrop();
    }

    public componentDidUpdate() {
        this.setBackdrop();
    }

    public render() {
        const c = this.className;
        const { backdrop } = this.state;

        if (!backdrop) { return null; }

        return createPortal(
            <div className={c}>
                <div className={`${c}-text`}>
                    <img alt="leaf-logo" className="logo" src={process.env.PUBLIC_URL + '/images/logos/apps/leaf.svg'} />
                    <strong>For more information about the Leaf data visualization tool, please click <a href="https://leafdocs.rit.uw.edu/" target="_blank">here</a>.</strong>
                </div>
            </div>, 
            backdrop
        );
    }

    /*
     * Set the backdrop element if loaded, then remove the 'shown'
     * class after update (this provides the CSS opacity transition).
     */
    private setBackdrop = () => {
        if (!this.state.backdrop) {
            const backdrop = document.querySelector('.attestation-modal-wrap .modal');
            this.setState({ backdrop });
        }
    }
}