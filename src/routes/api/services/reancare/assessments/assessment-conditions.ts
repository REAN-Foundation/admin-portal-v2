import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY } from '$env/static/private';
import { DashboardManager } from '$routes/api/cache/dashboard/dashboard.manager';
import { post} from '../common.reancare';

////////////////////////////////////////////////////////////////////
export const createAssessmentCondition = async (
	sessionId: string,
	templateId: string,
	nodeId: string,
	pathId: string,
	OptionSequece: number
) => {

	const body = {
	IsCompositeCondition: false,
    ParentConditionId: null,
    OperatorType: "Equal to",
    FirstOperand: {
        DataType: "Integer",
        Name: "ReceivedAnswer",
        Value: null
    },
    SecondOperand: {
        DataType: "Integer",
        Name: "ExpectedAnswer",
        Value: OptionSequece
    }
	}

	const url = BACKEND_API_URL + `/clinical/assessment-templates/${templateId}/nodes/${nodeId}/paths/${pathId}/conditions`;
	const result = await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);

	// Clear relevant cache
	const findAndClearKeys = [
		`session-${sessionId}:req-getAssessmentPathById-${pathId}`,
		`session-${sessionId}:req-getAssessmentPaths`,
	];
	await DashboardManager.findAndClear(findAndClearKeys);

	return result;
};

