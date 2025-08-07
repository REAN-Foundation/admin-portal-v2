# Assessment Paths & Conditions Management

This document describes the enhanced assessment path management system that supports conditional flows for Yes/No questions and other assessment scenarios.

## Overview

The assessment path system allows you to:
- Create paths for different answer options (Yes, No, Maybe, Skip)
- Set conditions for each path based on user responses
- Configure next nodes for each path
- Add custom messages before questions
- Visualize the assessment flow

## Features

### 1. Quick Path Creation
- **Yes/No Paths**: Quickly create paths for Yes and No answers
- **Individual Options**: Create paths for specific answers (Yes, No, Maybe, Skip)
- **Custom Paths**: Create custom paths for unique scenarios

### 2. Conditional Logic
- **Operand Configuration**: Set up ReceivedAnswer vs ExpectedAnswer comparisons
- **Operator Types**: Support for various operators (Equal to, Not equal to, etc.)
- **Composite Conditions**: Support for AND/OR logic combinations

### 3. Next Node Management
- **Flow Control**: Set which node the assessment should go to next
- **Message Support**: Add custom messages before the next node
- **Visual Indicators**: Clear status indicators for connected/unconnected paths

### 4. Visual Interface
- **Grid Layout**: Clean, organized display of paths
- **Status Indicators**: Color-coded badges for different answer types
- **Flow Visualization**: Visual representation of assessment flow
- **Summary Statistics**: Overview of total paths, conditions, and connections

## API Endpoints

### Path Management
```
GET    /api/server/assessments/{templateId}/nodes/{nodeId}/paths
POST   /api/server/assessments/{templateId}/nodes/{nodeId}/paths
PUT    /api/server/assessments/{templateId}/nodes/{nodeId}/paths/{pathId}
DELETE /api/server/assessments/{templateId}/nodes/{nodeId}/paths/{pathId}
```

### Condition Management
```
POST   /api/server/assessments/{templateId}/nodes/{nodeId}/paths/{pathId}/conditions
PUT    /api/server/assessments/{templateId}/nodes/{nodeId}/paths/{pathId}/conditions
DELETE /api/server/assessments/{templateId}/nodes/{nodeId}/paths/{pathId}/conditions
```

### Next Node Management
```
PUT    /api/server/assessments/{templateId}/nodes/{nodeId}/paths/{pathId}/set-next-node/{nextNodeId}
DELETE /api/server/assessments/{templateId}/nodes/{nodeId}/paths/{pathId}/set-next-node/{nextNodeId}
```

## Usage Example

### Scenario: Medication Compliance Question

**Question**: "Have you taken your prescribed medications?"

**Desired Flow**:
- **Yes** → Follow-up questions about side effects
- **No** → Exit assessment with reminder message

### Step-by-Step Configuration

1. **Create Paths**:
   - Click "Add Yes/No Paths" to create paths for Yes and No
   - Or use individual "Yes" and "No" buttons

2. **Configure Conditions**:
   - For Yes path: Set condition to check if ReceivedAnswer equals "yes"
   - For No path: Set condition to check if ReceivedAnswer equals "no"

3. **Set Next Nodes**:
   - Yes path: Set next node to "Follow-up Questions"
   - No path: Set next node to "Exit Assessment"

4. **Add Messages**:
   - Yes path: "Great! Let's check for any side effects."
   - No path: "Please take your medication as prescribed."

## Component Structure

### AssessmentPathManager.svelte
Main component for managing assessment paths with the following features:

- **Props**:
  - `paths`: Array of assessment paths
  - `availableNodes`: Array of available next nodes
  - `parentNodeId`: Current node ID
  - `templateId`: Template ID
  - `onPathChange`: Callback for path changes

- **Features**:
  - Quick path creation for common answer types
  - Condition configuration with operand setup
  - Next node selection and management
  - Visual flow representation
  - Status indicators and statistics

### Types

```typescript
interface CAssessmentNodePath {
    id?: string;
    DisplayCode?: string;
    ParentNodeId?: string;
    NextNodeId?: string;
    ConditionId?: string;
    Condition?: CAssessmentPathCondition;
    IsExitPath?: boolean;
    MessageBeforeQuestion?: string;
}

interface CAssessmentPathCondition {
    id?: string;
    DisplayCode?: string;
    NodeId?: string;
    PathId?: string;
    IsCompositeCondition?: boolean;
    CompositionType?: ConditionCompositionType;
    OperatorType?: ConditionOperatorType;
    FirstOperand?: ConditionOperand;
    SecondOperand?: ConditionOperand;
    ThirdOperand?: ConditionOperand;
}
```

## Demo Page

Access the demo page at:
```
/users/{userId}/assessment-templates/{templateId}/assessment-nodes/{nodeId}/paths-demo
```

The demo page provides:
- Interactive example with sample data
- Step-by-step instructions
- Visual demonstration of the path management system
- Real-time updates and feedback

## Backend Integration

The system integrates with your existing backend endpoints:

- **Path Creation**: `/clinical/assessment-templates/{ASSESSMENT_TEMPLATE_ID}/nodes/{FA_ASSESSMENT_NODE_ID_1_1}/paths`
- **Condition Setting**: `/clinical/assessment-templates/{ASSESSMENT_TEMPLATE_ID}/nodes/{FA_ASSESSMENT_NODE_ID_1_1}/paths/{FA_QUESTION_1_1_BUSY_PATH}/conditions`
- **Next Node Setting**: `/clinical/assessment-templates/{ASSESSMENT_TEMPLATE_ID}/nodes/{FA_ASSESSMENT_NODE_ID_1_1}/paths/{FA_QUESTION_1_1_BUSY_PATH}/set-next-node/{FA_ASSESSMENT_NODE_ID_1_2}`

## Best Practices

1. **Naming Conventions**:
   - Use descriptive display codes (e.g., "PATH_YES_MEDICATION", "PATH_NO_MEDICATION")
   - Keep condition names clear and meaningful

2. **Condition Setup**:
   - First Operand: Usually "ReceivedAnswer" (what the user selected)
   - Second Operand: Usually "ExpectedAnswer" (what you're checking against)
   - Use appropriate data types (Text for Yes/No, Integer for scores, etc.)

3. **Flow Design**:
   - Keep paths simple and logical
   - Use exit paths sparingly
   - Add helpful messages to guide users

4. **Testing**:
   - Test all possible answer combinations
   - Verify conditions work as expected
   - Check that next nodes are correctly set

## Troubleshooting

### Common Issues

1. **Paths not saving**: Check that the path has a valid NextNodeId
2. **Conditions not working**: Verify operand names and values match exactly
3. **Next node not set**: Ensure the target node exists and is accessible

### Debug Tips

- Use browser developer tools to check API responses
- Verify session authentication is working
- Check console logs for error messages
- Validate data types match expected formats

## Future Enhancements

Potential improvements for future versions:

1. **Advanced Conditions**: Support for more complex logical operators
2. **Bulk Operations**: Create multiple paths at once
3. **Flow Visualization**: Interactive diagram of assessment flow
4. **Condition Templates**: Pre-built condition patterns
5. **Validation Rules**: Automatic validation of path configurations
6. **Import/Export**: Save and load path configurations

## Support

For issues or questions:
1. Check the demo page for examples
2. Review the API documentation
3. Test with the provided sample data
4. Contact the development team for assistance 