import * as React from "react";
import { Provider, Flex, Header, Dropdown, TextArea, Input, ThemePrepared, themes } from "@fluentui/react-northstar";
import TeamsBaseComponent, { ITeamsBaseComponentState } from "msteams-react-base-component";
import * as microsoftTeams from "@microsoft/teams-js";
import { map, find } from "lodash";
import * as OT from "@opentok/client";

import { OTSession, OTPublisher, OTStreams, OTSubscriber } from "opentok-react";
import Settings from "./Settings";
import SidePanel from "./SidePanel";
/**
 * State for the interprefyTabTab React component
 */
export interface IInterprefyTabState extends ITeamsBaseComponentState {
    entityId?: string;
    teamsTheme: any;
    frameContext: string;
    meetingId: string;
}

/**
 * Properties for the interprefyTabTab React component
 */
export interface IInterprefyTabProps {

}

/**
 * Implementation of the InterprefyTab content page
 */
export class InterprefyTab extends TeamsBaseComponent<IInterprefyTabProps, IInterprefyTabState> {
    public async componentWillMount() {
        this.updateTheme(this.getQueryVariable("theme"));

        if (await this.inTeams()) {
            microsoftTeams.initialize();
            microsoftTeams.registerOnThemeChangeHandler(this.updateTheme);
            microsoftTeams.getContext((context: any) => {
                microsoftTeams.appInitialization.notifySuccess();
                this.setState({
                    entityId: context.entityId,
                    frameContext: context.frameContext,
                    meetingId: context.meetingId
                });
                this.updateTheme(context.theme);
            });
        } else {
            this.setState({
                entityId: "This is not hosted in Microsoft Teams"
            });
        }
    }

    /**
     * The render() method to create the UI of the tab
     */
    public render() {
        return (
            this.state.frameContext === "content" ?
                <Settings theme={this.state.theme}></Settings> :
            this.state.frameContext === "sidePanel" ?
                <SidePanel meetingId="asd1234567"></SidePanel> : <SidePanel meetingId="asd1234567"></SidePanel>
        );
    }
}
