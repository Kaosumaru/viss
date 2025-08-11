/* eslint-disable no-constant-binary-expression */
import { type RenderEmit, Presets } from "rete-react-plugin";
import { Paper, Tooltip, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import ErrorIcon from "@mui/icons-material/Error";
import type { Schemes } from "../node";
import type { JSX } from "react";

type NodeExtraData = { width?: number; height?: number; errorMessage?: string };

const { RefSocket, RefControl } = Presets.classic;

export const selectedShadow = "0px 2px 6px 2px #985700, 0 0 0px 5px #c9b144;";

const StyledPaper = styled(Paper)<{ selected?: boolean }>(({ selected }) => ({
  minWidth: "auto",
  border: "1px solid #000 !important",

  boxShadow: selected ? selectedShadow : "0 5px 5px 1px rgba(0,0,0,.3)",
  zIndex: 1,
  position: "relative",

  "& .output, & .input": {
    display: "flex",
    alignItems: "center",
  },

  "& .output": {
    justifyContent: "flex-end",
  },

  "& .title": {
    whiteSpace: "nowrap",
    fontSize: "20px",
    padding: "5px",
    borderRadius: "15px 15px 0 0",
    textAlign: "center",
    overflow: "hidden",
    textOverflow: "ellipsis",
    fontFamily: '"Montserrat", sans-serif !important',
    fontWeight: 300,
    position: "relative",
  },

  "& .error-icon": {
    position: "absolute",
    top: "2px",
    right: "2px",
    color: "#f44336",
    padding: "2px",
    zIndex: 10,
    "& .MuiSvgIcon-root": {
      fontSize: "24px",
    },
  },

  "& .input-title, & .output-title": {
    fontFamily: '"Montserrat", sans-serif !important',
    fontWeight: 300,
    fontSize: "14px",
    textOverflow: "ellipsis",
    overflow: "hidden",
  },

  "& .input-socket, & .output-socket": {
    position: "relative",
    zIndex: 5,
  },

  "& .controls": {
    padding: "0px 10px 0px 10px",
  },

  "& .input-socket": {
    marginLeft: "5px !important",
  },

  "& .output-socket": {
    marginRight: "5px !important",
  },

  "& .input-control": {
    overflow: "hidden",
    padding: "2px",
  },

  "& .columns": {
    display: "flex",
    "& .column": {
      overflow: "hidden",
      flex: 1,
      flexBasis: "content",
    },
  },
}));

type Props<S extends Schemes> = {
  data: S["Node"] & NodeExtraData;
  emit: RenderEmit<S>;
};

export type NodeComponent<Scheme extends Schemes> = (
  props: Props<Scheme>
) => JSX.Element;

export function Node<Scheme extends Schemes>(props: Props<Scheme>) {
  const inputs = Object.entries(props.data.inputs);
  const outputs = Object.entries(props.data.outputs);
  const controls = Object.entries(props.data.controls);
  const selected = props.data.selected || false;
  const nodeData = props.data as Scheme["Node"] & NodeExtraData;
  const errorMessage = nodeData.errorMessage;

  return (
    <StyledPaper
      selected={selected}
      style={{ width: props.data.width, height: props.data.height }}
      data-node-id={props.data.id}
      elevation={selected ? 8 : 3}
    >
      {/* <div style={{ position: 'absolute', top: '-1em', right: '1em' }}>{props.data.id}</div> */}
      <div className="glossy rete-node"></div>
      <div className="title">
        {props.data.label}
        {errorMessage && (
          <Tooltip title={errorMessage} placement="top">
            <IconButton className="error-icon">
              <ErrorIcon fontSize="medium" color="error" />
            </IconButton>
          </Tooltip>
        )}
      </div>
      <div className="columns">
        <div className="column">
          {/* Inputs */}
          {inputs.map(
            ([key, input]) =>
              input && (
                <div className="input" key={key}>
                  <RefSocket
                    name="input-socket"
                    side="input"
                    socketKey={key}
                    nodeId={props.data.id}
                    emit={props.emit}
                    payload={input.socket}
                    data-testid="input-socket"
                  />
                  {input && (!input.control || !input.showControl) && (
                    <div className="input-title">{input?.label}</div>
                  )}
                  {input?.control && input?.showControl && (
                    <RefControl
                      key={key}
                      name="input-control"
                      emit={props.emit}
                      payload={input.control}
                      data-testid="input-control"
                    />
                  )}
                </div>
              )
          )}
        </div>
        <div className="column">
          {/* Outputs */}
          {outputs.map(
            ([key, output]) =>
              output && (
                <div className="output" key={key}>
                  {true /*!output?.control*/ && (
                    <div className="output-title">{output?.label}</div>
                  )}
                  {/*output?.control && (
                    <RefControl
                      key={key}
                      name="output-control"
                      emit={props.emit}
                      payload={output.control}
                      data-testid="output-control"
                    />
                  )*/}
                  <RefSocket
                    name="output-socket"
                    side="output"
                    socketKey={key}
                    nodeId={props.data.id}
                    emit={props.emit}
                    payload={output.socket}
                    data-testid="output-socket"
                  />
                </div>
              )
          )}
        </div>
      </div>
      {/* Controls */}
      <div className="controls">
        {controls.map(([key, control]) => {
          return control ? (
            <RefControl
              key={key}
              name="control"
              emit={props.emit}
              payload={control}
              data-testid={`control-${key}`}
            />
          ) : null;
        })}
      </div>
    </StyledPaper>
  );
}
