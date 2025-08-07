export interface CAssessmentPathCondition {
    id?: string;
    DisplayCode?: string;
    NodeId?: string;
    PathId?: string;    // Chosen path if the condition satisfies

    // For composition type condition
    IsCompositeCondition?: boolean;
    CompositionType?: ConditionCompositionType;
    ParentConditionId?: string;
    OperatorType?: ConditionOperatorType;

    FirstOperand?: ConditionOperand;
    SecondOperand?: ConditionOperand;
    ThirdOperand?: ConditionOperand;

    Children?: CAssessmentPathCondition[];
}

export interface CAssessmentNodePath {
    id?: string;
    DisplayCode?: string;
    ParentNodeId?: string;
    ParentNodeDisplayCode?: string;
    NextNodeId?: string;
    NextNodeDisplayCode?: string;
    ConditionId?: string;
    Condition?: CAssessmentPathCondition;
    IsExitPath?: boolean;
    MessageBeforeQuestion?: string;
}

export enum ConditionCompositionType {
    And = 'And',
    Or = 'Or',
    XOr = 'XOr'
}

export const ConditionCompositionTypeList: ConditionCompositionType[] = [
    ConditionCompositionType.And,
    ConditionCompositionType.Or,
];

export enum ConditionOperatorType {
    EqualTo = 'Equal to',
    NotEqualTo = 'Not equal to',
    GreaterThan = 'Greater than',
    GreaterThanEqualTo = 'Greater than or equal to',
    LessThan = 'Less than',
    LessThanEqualTo = 'Less than or equal to',
    In = 'In',
    Between = 'Between',
    IsTrue = 'Is true',
    IsFalse = 'Is false',
    Exists = 'Exists',
    None = 'None'
}

export const ConditionOperatorTypeList: ConditionOperatorType[] = [
    ConditionOperatorType.EqualTo,
    ConditionOperatorType.NotEqualTo,
    ConditionOperatorType.GreaterThan,
    ConditionOperatorType.GreaterThanEqualTo,
    ConditionOperatorType.LessThan,
    ConditionOperatorType.LessThanEqualTo,
    ConditionOperatorType.In,
    ConditionOperatorType.Between,
    ConditionOperatorType.IsTrue,
    ConditionOperatorType.IsFalse,
    ConditionOperatorType.Exists,
    ConditionOperatorType.None,
];

export enum ConditionOperandDataType {
    Float = 'Float',
    Integer = 'Integer',
    Boolean = 'Boolean',
    Text = 'Text',
    Array = 'Array'
}

export const ConditionOperandDataTypeList: ConditionOperandDataType[] = [
    ConditionOperandDataType.Float,
    ConditionOperandDataType.Integer,
    ConditionOperandDataType.Boolean,
    ConditionOperandDataType.Text,
    ConditionOperandDataType.Array,
];

export interface ConditionOperand {
    Name?: string;
    Value?: string | number | boolean | null;
    DataType?: ConditionOperandDataType;
} 