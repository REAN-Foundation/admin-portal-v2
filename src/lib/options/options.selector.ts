import { SystemTypes } from '../system.types';
import { Options as AHAFeatureOptions } from './aha.options';
import { Options as REANFeatureOptions } from './rean.options';
import { Options as GMUFeatureOptions } from './gmu.options';
import { SYSTEM_ID } from '../constants';

//////////////////////////////////////////////////////////////////////////////

export const getFeatureOptions = () => {
    const systemType: SystemTypes = SYSTEM_ID as SystemTypes;
    switch (systemType as SystemTypes) {
        case SystemTypes.REAN:
            return REANFeatureOptions;
        case SystemTypes.AHA:
            return AHAFeatureOptions;
        case SystemTypes.GMU:
            return GMUFeatureOptions;
        default:
            return REANFeatureOptions;
    }
};
