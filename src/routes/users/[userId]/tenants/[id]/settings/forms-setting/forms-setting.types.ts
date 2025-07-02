import type { FormsUISettings } from "$lib/types/tenant.settings.types";

export const formsUISettings: FormsUISettings = {
    Integrations: {
        KoboToolbox: {
            Name: 'Kobo Toolbox',
            Path: 'mdi:form-select',
            Description: 'Data collection platform for field research and surveys.'
        },
        ODK: {
            Name: 'ODK',
            Path: 'mdi:cellphone-information',
            Description: 'Open-source mobile data collection toolkit.'
        },
        GoogleForm: {
            Name: 'Google Form',
            Path: 'mdi:google',
            Description: 'Cloud-based form creation and survey tool.'
        },
    },
    OfflineSupport: {
        Name: 'Offline Support',
        Path: 'mdi:cloud-off-outline',
        Description: 'Enable data collection without internet connectivity.'
    },
    FieldApp: {
        Name: 'Field App',
        Path: 'mdi:cellphone-android',
        Description: 'Mobile app for on-site data collection.'
    }
}
