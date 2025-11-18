export const FLOW_JSON_VERSION = "7.3";
export interface FlowJSONSchema {
    version: string;
    data_api_version?: string;
    screens: Screen[];
    routing_model?: Record<string, string[]>;
    data_channel_uri?: string; 
  }
  
  export interface Screen {
    id: string;
    title?: string;
    data?: Record<string, any>;
    terminal?: boolean;
    refresh_on_back?: boolean;
    layout: Layout;
    success?: boolean;
    sensitive?: string[];
  }

 export interface Layout {
    type: "SingleColumnLayout";
    children: Form[];
  }
  
  export interface Form {
    type: "Form";
    name: string;
    children: Component[];
  }
  
  export type Component =
    | TextHeading
    | TextBody
    | TextInput
    | RadioButtonsGroup
    | CheckboxGroup
    | DatePicker
    | Footer;
  
  export interface TextHeading {
    type: "TextHeading";
    text: string;
  }
  
  export interface TextBody {
    type: "TextBody";
    text: string;
  }
  
  export interface TextInput {
    type: "TextInput";
    name: string;
    label: string;
    required?: boolean;
    "input-type"?: string;
    "helper-text"?: string;
  }
  export interface CheckboxGroup {
    type: "CheckboxGroup";
    name: string;
    label: string;
    required?: boolean;
    enabled?: boolean;
    visible?: boolean;
    description?: string;
    "min-selected-items"?: number;
    "max-selected-items"?: number;
    "data-source": {
      id: string;
      title: string;
      enabled?: boolean;
      description?: string;
    }[];   
  }
  
  export interface RadioButtonsGroup {
    type: "RadioButtonsGroup";
    name: string;
    label: string;
    required?: boolean;
    "data-source": { id: string; title: string }[];
  }
  
  export interface DatePicker {
    type: "DatePicker";
    name: string;
    label: string;
    required?: boolean;
  }

  export interface Footer {
    type: "Footer";
    label: string;
    "on-click-action": {
      name: "complete" | "navigate";
      next?: { type: "screen"; name: string };
      payload?: Record<string, any>;
    };
  }
  
  export type ChildElement = {
    type: string;
    name?: string;
    "input-type"?: string;
  };
  
  export interface DataSchema {
    [key: string]: {
      type: string;
      __example__: any;
      items?: { type: string };
    };
  }
