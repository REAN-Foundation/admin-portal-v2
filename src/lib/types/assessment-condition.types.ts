export enum ConditionCompositionType {
	And = 'And',
	Or = 'Or',
	Not = 'Not'
}

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

export enum ConditionOperandDataType {
	Float = 'Float',
	Integer = 'Integer',
	Boolean = 'Boolean',
	Text = 'Text',
	Array = 'Array'
}

export interface ConditionOperand {
	DataType: ConditionOperandDataType;
	Value: string | number | boolean | string[];
	FieldIdentifier?: string;
	FieldIdentifierUnit?: string;
}

export interface AssessmentConditionCreateModel {
	TemplateId?: string;
	NodeId?: string;
	PathId?: string; // Chosen path if the condition satisfies
	OptionSequence ?: number; // Chosen option sequence if the condition satisfies
}
