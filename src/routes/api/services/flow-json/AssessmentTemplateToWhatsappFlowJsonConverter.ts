
import type { AssessmentNode, AssessmentTemplate } from "$lib/types/assessments.type";
import { FlowJson } from "./flow.json";
import { FLOW_JSON_VERSION, type Component, type FlowJSONSchema, type Footer, type Form, type Screen } from "$lib/types/flow.json.types";

export class AssessmentTemplateToWhatsappFlowJsonConverter {

    convert = (assessmentTemplate: AssessmentTemplate): FlowJSONSchema => {
        try {
            const listNodes = this.getListNodes(assessmentTemplate);

            const flowJson = this.generateFlowJson(listNodes, assessmentTemplate);
            return flowJson;
        } catch (error) {
            console.error(error);
            throw new Error("Failed to convert assessment template to WhatsApp Flow JSON");
        }
    }

    private getListNodes = (assessment: AssessmentTemplate) => {
        const listNodes =  assessment.Nodes.filter(node => node.NodeType === "Node list")
        listNodes.sort((a, b) => (a.Sequence || 0) - (b.Sequence || 0));
        return listNodes;
      }

      private generateFlowJson = (nodeLists: AssessmentNode[], assessmentData: AssessmentTemplate) => {
        const screens: Screen[] = []
        let data: Record<string, any> = {};

        const totalListNodes = nodeLists.length;
        let questionSequenceNumber = 1;

        let payload: Record<string, any> = {};

        nodeLists.forEach((listNode, index) => {
            const childrenNodeDisplayCodes = listNode.ChildrenNodeDisplayCodes
            const title = listNode.Title;

            const nodes = assessmentData.Nodes.filter(node =>
                childrenNodeDisplayCodes?.includes(node.DisplayCode)
              );

            const listNodeAssessmentData = { ...assessmentData };
            listNodeAssessmentData.Nodes = [...nodes];
            listNodeAssessmentData.Title = title;

            const screen = this.convertAssessmentToFlowJSON(listNodeAssessmentData, index + 1, totalListNodes, questionSequenceNumber, payload, nodeLists);
            
            screen.screen.data = {...data};

            payload = {...payload, ...this.replaceFormWithData(screen.payload)};

            questionSequenceNumber = questionSequenceNumber + nodes.length;
            screens.push(screen.screen);

            const payloadData = FlowJson.generateFlowDataSchema(screen.screen.layout.children[0].children);
            
            data = {...data, ...payloadData};
        })
        // Final Flow JSON
        const flow: FlowJSONSchema = {
          version: FLOW_JSON_VERSION,
          screens: screens
        };
      
        return flow;
      }

      private convertAssessmentToFlowJSON = (
        assessment: AssessmentTemplate,
        currentNodeIndex: number,
        totalListNodes: number,
        questionSequenceNumber: number,
        payload: Record<string, any> = {},
        nodeList: AssessmentNode[]
      ): {screen: Screen, payload: Record<string, any>} => {
    
        const screenId = this.getScreenId(assessment.Title);
      
        const components: Component[] = [];
        const answers: Record<string, string> = {};
        let footer: Footer;

        assessment.Nodes.filter(node => node.NodeType === "Question")
          .sort((a, b) => (a.Sequence || 0) - (b.Sequence || 0))
          .forEach((node) => {
            const component = FlowJson.createComponent(node, questionSequenceNumber);
            if (component) {
              components.push(component);
            }
            const questionName = `question_${questionSequenceNumber}`
            answers[questionName] = `\${form.${questionName}}`;
            questionSequenceNumber++;
          });
      
        // Add footer with payload
        if (currentNodeIndex === totalListNodes) {
          footer = {
            type: "Footer",
            label: "Submit",
            "on-click-action": {
              name: "complete",
              payload: {
                AssessmentTemplateTitle: assessment.Title,
                AssessmentWithFormSubmission: true,
                Answers: {...payload, ...answers}
              }
            }
          };
        }
        else {
        footer = {
          type: "Footer",
          label: "Continue",
          "on-click-action": {
            name: "navigate",
            next: { type: "screen", name: this.getScreenId(nodeList[currentNodeIndex]?.Title)},
            payload: {
                ...payload,
             ...answers
            }
          }
        }}
        
        // Build full form
        const form: Form = {
          type: "Form",
          name: `${screenId.toLowerCase()}_form`,
          children: [
            { type: "TextHeading", text: assessment.Title },
            ...components,
            footer
          ]
        };
      
        // Build screen
        const screen: Screen = {
          id: screenId,
          title: assessment.Title,
          data: {},
          terminal: currentNodeIndex === totalListNodes,
          layout: {
            type: "SingleColumnLayout",
            children: [form]
          }
        };
      
       return {screen, payload: {...payload, ...answers}};
      }
      
      private getScreenId = (title: string) => {
        if (!title)
        {
            return "WELCOME";
        }
        return title.replace(/\s+/g, "_").toUpperCase();
      }
    
      private replaceFormWithData = (payload: Record<string, string>): Record<string, string> => {
        const result: Record<string, string> = {};
      
        Object.entries(payload).forEach(([key, value]) => {
          result[key] = value.replace("${form.", "${data.");
        });
      
        return result;
      }

  
}
