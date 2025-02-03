/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Button } from 'reactstrap';
import { SessionType } from '../../models/Session'
import { AppConfig } from '../../models/Auth';

interface Props {
    config?: AppConfig;
    className: string;
    handleGoBackClick: () => void;
    handleIAgreeClick: () => void;
    hasAttested: boolean;
    isIdentified: boolean;
    isSubmittingAttestation: boolean;
    show: boolean;
    sessionLoadDisplay: string;
    sessionType: SessionType;
}

export default class StandardAttestationConfirmation extends React.PureComponent<Props> {
    public render() {
        const c = this.props.className;
        const { show, handleIAgreeClick, sessionLoadDisplay, hasAttested, isSubmittingAttestation, config } = this.props;
        const confirmationClass = `${c}-confirmation-container ${show ? 'show' : ''}`
       // const useDisplay = sessionType === SessionType.Research ? 'Research' : 'Quality Improvement';
       // const phiDisplay = isIdentified ? 'Identified' : 'Deidentified';
        const showText = config && config.attestation.enabled;

        return  (
            <div className={confirmationClass}>
                {/* {showText && [
                <div className={`${c}-confirmation-settings`} key='1'>
                    {useDisplay} - {phiDisplay}
                </div>,
                <p key='2'>
                    I attest that the information I have entered is accurate and I will
                    use the application, Leaf, as I have indicated.
                </p>
                ]} */}
                {/* make this text configurable, maybe need to modify the model include this custom text, see  https://github.com/uwcirg/leaf/blob/master/src/server/Model/Options/AttestationOptions.cs */}
                <p>HIV Success uses Leaf, a self-service tool which provides a user-friendly interface to execute queries and retrieve information about study data.</p>
                {!(isSubmittingAttestation || hasAttested) &&
                <div className={`${c}-confirmation-footer`}>
                    {/* {config && !config.attestation.skipModeSelection &&
                    <Button 
                        onClick={handleGoBackClick} 
                        tabIndex={-1}
                        className="leaf-button mr-auto">
                        Go Back
                    </Button>
                    } */}
                    <Button 
                        onClick={handleIAgreeClick} 
                        tabIndex={-1}
                        className="leaf-button leaf-button-primary" 
                    >
                        Access the Data Exploration Tool
                    </Button>
                </div>
                }
                {(isSubmittingAttestation || hasAttested) &&
                    <div className={`${c}-session-load-display-container`}>
                        <div className={`${c}-session-load-display`}>
                            <span>...{sessionLoadDisplay}</span>
                        </div>
                    </div>
                }
            </div>
        );
    }
}