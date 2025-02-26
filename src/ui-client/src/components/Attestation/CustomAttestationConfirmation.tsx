/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Button, Row, Col } from 'reactstrap';
import { SessionType } from '../../models/Session'
import { AppConfig, CustomAttestationType } from '../../models/Auth';

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

export default class CustomAttestationConfirmation extends React.PureComponent<Props> {
    public render() {
        const c = this.props.className;
        const { show, handleGoBackClick, handleIAgreeClick, isIdentified, sessionType, sessionLoadDisplay, hasAttested, isSubmittingAttestation, config } = this.props;
        const confirmationClass = `${c}-confirmation-container ${show ? 'show' : ''}`
        const useDisplay = sessionType === SessionType.Research ? 'Research' : 'Quality Improvement';
        const phiDisplay = isIdentified ? 'Identified' : 'Deidentified';
        const showText = config && config.attestation.enabled;
        const useHtml = config.attestation.type && config.attestation.type === CustomAttestationType.Html;
        const skipModeSelection = config && config.attestation.skipModeSelection;
        const nextButtonContainerColSize = skipModeSelection ? 12: 6;
        const nextButtonContainerClass = skipModeSelection ? "" : "right";
        const nextButtonText = skipModeSelection ? "Access the Data Exploration Tool" : "I Agree";

        return  (
            <div className={confirmationClass}>
                  {!skipModeSelection && 
                        <div  className={`${c}-confirmation-settings left`}>
                            {useDisplay} - {phiDisplay}
                        </div>}
                 <div>
                    {/* use custom text */}
                    {useHtml &&
                        <div className={`${c}-custom-html`} dangerouslySetInnerHTML={ {__html: config.attestation.text.join("")} }></div>
                    }

                    {!useHtml &&
                        <div className={`${c}-custom-text-container`}>
                            {config.attestation.text.map((t,i) => {
                                return <p key={i} className={`${c}-custom-text`}>{t}</p>;
                            })}
                        </div>
                    }
                </div>
                {showText &&
                <div className={`${c}-confirmation-settings`} key='1'>
                    <Row className={`${c}-confirmation-settings custom`} key='1'>
                
                        {!(isSubmittingAttestation || hasAttested) &&
                        <Col md={12}>
                            <Button 
                                onClick={handleIAgreeClick} 
                                tabIndex={-1}
                                className="leaf-button leaf-button-primary">
                                {nextButtonText}
                            </Button>
                            {" "}
                            {!skipModeSelection &&
                            <Button 
                                onClick={handleGoBackClick} 
                                tabIndex={-1}
                                className="leaf-button">
                                Go Back
                            </Button>
                            }
                        </Col>
                        }
                        {(isSubmittingAttestation || hasAttested) &&
                        <Col md={12}>
                            <div className={`${c}-session-load-display-container custom`}>
                                <div className={`${c}-session-load-display`}>
                                    <span>...{sessionLoadDisplay}</span>
                                </div>
                            </div>
                        </Col>
                        }
                    </Row>
                </div>
                }
            </div>
        );
    }
}