/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { NavItem } from 'reactstrap';
import { FaDoorOpen } from 'react-icons/fa';
import { AuthorizationState } from '../../models/state/AppState';

interface Props {
    auth?: AuthorizationState;
    logoutClickHandler: () => any;
}

export default class UserButton extends React.PureComponent<Props> {
    private className = 'header';

    public render() {
        const c = this.className;
        const { auth, logoutClickHandler} = this.props;
        const authLogoutEnabled = auth && auth.config && auth.config.authentication.logout.enabled;
        if (!authLogoutEnabled) return null;
        return (
            <NavItem className={`${c}-myleaf ${c}-item-dropdown ${c}-item-hover-dark`}>
                <div className={`${c}-myleaf-icon-container`} onClick={logoutClickHandler}>
                    <FaDoorOpen className="header-options-icon header-myleaf-icon" />
                    <span className="header-options-text">Log Out</span>
                </div>
            </NavItem>
        );
    }
}
