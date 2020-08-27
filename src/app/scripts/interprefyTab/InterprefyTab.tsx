import * as React from "react";
import TeamsBaseComponent, { ITeamsBaseComponentState } from "msteams-react-base-component";
import * as microsoftTeams from "@microsoft/teams-js";
import { Provider } from "@fluentui/react-northstar";

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
                const decodedMeetingId = atob(context.meetingId);
                const meetingId = decodedMeetingId.slice(decodedMeetingId.indexOf("meeting"), decodedMeetingId.indexOf("@thread"));

                this.setState({
                    entityId: context.entityId,
                    frameContext: context.frameContext,
                    meetingId
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
            <Provider theme={this.state.theme}>
                {
                    this.state.frameContext === "content" ?
                        <Settings meetingId={this.state.meetingId}></Settings> :
                        (this.state.frameContext === "sidePanel" ?
                            <SidePanel meetingId={this.state.meetingId}></SidePanel> : null)
                }
                {/* <SidePanel meetingId={this.state.meetingId}></SidePanel> */}
                {/* <Settings meetingId={this.state.meetingId}></Settings> */}
            </Provider>
        );
    }
}
