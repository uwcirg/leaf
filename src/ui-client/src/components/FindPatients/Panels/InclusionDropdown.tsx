/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { Panel as PanelModel } from '../../../models/panel/Panel';
import { PanelHandlers } from './PanelGroup';

interface State {
    dropdownOpen: boolean
}

interface Props {
    handlers: PanelHandlers;
    inclusionDropdownType: string,
    isFirst: boolean,
    index: number,
    panel: PanelModel,
}

export const INCLUSION_DROPDOWN_TYPE = {
    PANEL: 'PANEL',
    SUBPANEL: 'SUBPANEL'
}

export default class InclusionDropdown extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { dropdownOpen: false };
    }

    public render() {
        const { inclusionDropdownType, index, isFirst, panel } = this.props;
        const { dropdownOpen } = this.state;
        const classes: string[] = [ 'panel-header-inclusion' ];
        const isInclusionCriteria = inclusionDropdownType === INCLUSION_DROPDOWN_TYPE.PANEL 
            ? panel.includePanel 
            : panel.subPanels[index].includeSubPanel;
        const includeClasses = `leaf-dropdown-item ${isInclusionCriteria ? 'selected' : ''}`;
        const excludeClasses = `leaf-dropdown-item ${!isInclusionCriteria ? 'selected' : ''}`;
        let displayText: string;
        let opts: string[];

        // Set the text and options to display, depending on inclusion state and
        // whether it is the first panel or not
        if (isFirst) { 
            opts = [ 'Participants Who', 'Not Participants Who' ];
            displayText = isInclusionCriteria ? 'Participants Who' : 'Not Participants Who';
        }
        else {
            opts = [ 'And', 'And Not' ];
            displayText = isInclusionCriteria ? 'And' : 'And Not';
        }

        // Set class based on whether included or not
        if (!isInclusionCriteria) {
            classes.push('panel-header-inclusion-excluded');
        }

        return (
            <Dropdown isOpen={dropdownOpen} toggle={this.toggle} className={classes.join(' ')}>
                <DropdownToggle caret={true} >
                    {displayText}
                </DropdownToggle>
                <DropdownMenu>
                    <DropdownItem className={includeClasses} onClick={this.selectItem}>{opts[0]}</DropdownItem>
                    <DropdownItem className={excludeClasses} onClick={this.selectItem}>{opts[1]}</DropdownItem>
                </DropdownMenu>
            </Dropdown>
        );
    }

    private toggle = () => {
        this.setState((prevState: State) => ({
            dropdownOpen: !prevState.dropdownOpen
        }));
    }

    private selectItem = (item: any) => {
        const { index, inclusionDropdownType, panel, handlers } = this.props;
        const text = item.target.innerText;
        const include = text === 'Participants Who' || text === 'And' ? true : false;

        // Update state
        if (inclusionDropdownType === INCLUSION_DROPDOWN_TYPE.PANEL) {
            handlers.handlePanelInclusion(panel.index, include);
        } else {
            handlers.handleSubPanelInclusion(panel.index, index, include);
        }
    }
}
