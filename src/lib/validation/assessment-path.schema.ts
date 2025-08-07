import { z } from 'zod';
import { ConditionCompositionType, ConditionOperatorType, ConditionOperandDataType } from '$lib/types/assessment-path.types';

export const conditionOperandSchema = z.object({
    Type: z.enum(['VALUE', 'FIELD', 'RESPONSE', 'CONSTANT'], {
        required_error: 'Operand type is required.',
        invalid_type_error: 'Operand type must be one of: VALUE, FIELD, RESPONSE, CONSTANT.'
    }),
    Value: z.union([z.string(), z.number(), z.boolean()]).optional(),
    FieldName: z.string().optional(),
    ResponseField: z.string().optional(),
    ConstantValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
    DataType: z.nativeEnum(ConditionOperandDataType).optional()
});

export const assessmentPathConditionSchema = z.object({
    id: z.string().uuid().optional(),
    DisplayCode: z.string().optional(),
    NodeId: z.string().uuid().optional(),
    PathId: z.string().uuid().optional(),
    IsCompositeCondition: z.boolean().optional(),
    CompositionType: z.nativeEnum(ConditionCompositionType).optional(),
    ParentConditionId: z.string().uuid().optional(),
    OperatorType: z.nativeEnum(ConditionOperatorType).optional(),
    FirstOperand: conditionOperandSchema.optional(),
    SecondOperand: conditionOperandSchema.optional(),
    ThirdOperand: conditionOperandSchema.optional(),
    Children: z.array(z.lazy(() => assessmentPathConditionSchema)).optional()
});

export const assessmentNodePathSchema = z.object({
    id: z.string().uuid().optional(),
    DisplayCode: z.string().optional(),
    ParentNodeId: z.string().uuid('Parent Node ID must be a valid UUID.'),
    ParentNodeDisplayCode: z.string().optional(),
    NextNodeId: z.string().uuid('Next Node ID must be a valid UUID.'),
    NextNodeDisplayCode: z.string().optional(),
    ConditionId: z.string().uuid().optional(),
    Condition: assessmentPathConditionSchema.optional(),
    IsExitPath: z.boolean().optional().default(false),
    MessageBeforeQuestion: z.string().max(1024, {
        message: 'Message before question must be at most 1024 characters.'
    }).optional()
});

export const createPathSchema = assessmentNodePathSchema.omit({ id: true });
export const updatePathSchema = assessmentNodePathSchema.partial(); 