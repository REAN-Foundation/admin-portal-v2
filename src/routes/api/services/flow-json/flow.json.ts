import type { AssessmentNode } from "$lib/types/assessments.type";
import type { CheckboxGroup, ChildElement, DataSchema, DatePicker, RadioButtonsGroup, TextInput } from "$lib/types/flow.json.types";

export class FlowJson {
    static createComponent = (node: AssessmentNode, questionSequenceNumber: number) => {
        if (node.QueryResponseType === "Text") {
            const textInput: TextInput = {
              type: "TextInput",
              name: `question_${questionSequenceNumber}`,
              label: node.Title,
              required: true,
              "input-type": "text"
            };
            if (node.Description && node.Description.trim() !== "") {
              textInput["helper-text"] = node.Description.trim();
            }
            return textInput;
          }
    
          if (node.QueryResponseType === "Float" || node.QueryResponseType === "Integer") {
            const textInput: TextInput = {
              type: "TextInput",
              name: `question_${questionSequenceNumber}`,
              label: node.Title,
              required: true,
              "input-type": "number"
            };
            if (node.Description && node.Description.trim() !== "") {
              textInput["helper-text"] = node.Description.trim();
            }
            return textInput;
          }
    
          if ( node.QueryResponseType === "Single Choice Selection" && node.Options ||
            node.QueryResponseType === "Boolean" && node.Options
           ) {
            const radioGroup: RadioButtonsGroup = {
              type: "RadioButtonsGroup",
              name: `question_${questionSequenceNumber}`,
              label: node.Title,
              required: true,
              "data-source": node.Options.map(opt => ({
                id: opt.Text,
                title: opt.Text
              }))
            };
            return radioGroup;
          }
    
          if (node.QueryResponseType === "Boolean")
           {
            const radioGroup: RadioButtonsGroup = {
              type: "RadioButtonsGroup",
              name: `question_${questionSequenceNumber}`,
              label: node.Title,
              required: true,
              "data-source": [
                {
                  id: "True",
                  title: "True"
                },
                {
                  id: "False",
                  title: "False"
                }
              ]
            };
            return radioGroup;
          }
    
          if (node.QueryResponseType === "Multi Choice Selection" && node.Options) {
            const checkboxGroup: CheckboxGroup = {
              type: "CheckboxGroup",
              name: `question_${questionSequenceNumber}`,
              label: node.Title,
              required: true,
              "data-source": node.Options.map(opt => ({
                id: opt.Text,
                title: opt.Text
              }))
            };
            return checkboxGroup;
          }
    
          if (node.QueryResponseType === "Date" || node.QueryResponseType === "DateTime") {
            const datePicker: DatePicker = {
              type: "DatePicker",
              name: `question_${questionSequenceNumber}`,
              label: node.Title,
              required: true
            };
            return datePicker;
          }
    
      }

      static  generateFlowDataSchema = (children: ChildElement[]): DataSchema => {
        const schema: DataSchema = {};
      
        children.forEach((child) => {
          if (!child.name || !child.name.startsWith("question_")) return;
      
          let fieldType: string = "string";
          let example: any = "Example";
      
          switch (child.type) {
            case "TextInput":
              switch (child["input-type"]) {
                case "number":
                  fieldType = "number";
                  example = 10;
                  break;
                default:
                  fieldType = "string";
                  example = "Example";
                  break;
              }
              break;
      
            case "RadioButtonsGroup":
              fieldType = "string";
              example = "Example";
              break;
      
            case "CheckboxGroup":
              fieldType = "array";
              example = ["Reading", "Watching"];
              break;
      
            case "DatePicker":
              fieldType = "string";
              example = "Example";
              break;
      
            default:
              fieldType = "string";
              example = "Example";
              break;
          }
      
          schema[child.name] =
            fieldType === "array"
              ? {
                  type: fieldType,
                  items: { type: "string" },
                  __example__: example,
                }
              : {
                  type: fieldType,
                  __example__: example,
                };
        });
      
        console.log('Dataschema',schema);
        return schema;
      }
}
