import * as React from "react";
import { Flex } from "@fluentui/react-northstar";


const StatusBar = (props) => {
    return (
        <Flex
            className="fullWidth statusBar"
            styles={({ theme: { siteVariables } }) => ({
                backgroundColor: siteVariables.colorScheme.default.background3,
                borderColor: siteVariables.colorScheme.default.borderHover
            })}>
            <Flex className="fullWidth" styles={{ marginLeft: "50px" }}>
                {props.statuses.map((status) => <StatusPoint label={status.label} status={status.status} />)}
            </Flex>
        </Flex>
    );
};

export default StatusBar;

const StatusPoint = (props) => {
    return (
        <Flex.Item>
            <Flex
                className={`statusItem ${props.status || ""}`}>
                <Flex
                    column
                    hAlign="center"
                    className="statusPointWrapper">
                    <Flex className={`statusPoint ${(props.status || "")}`} hAlign="center" vAlign="center">
                        {props.status === "active" ? <div className="statusPointActiveInner"></div> : null}
                    </Flex>
                    <p>{props.label}</p>
                </Flex>
            </Flex>
        </Flex.Item>
    );
};
