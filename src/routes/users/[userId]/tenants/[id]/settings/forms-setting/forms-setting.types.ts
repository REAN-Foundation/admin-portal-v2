import type { FormsUISettings } from "$lib/types/tenant.settings.types";


export const formsUISettings: FormsUISettings = {
    Integrations: {
        KoboToolbox: {
            Name: 'Kobo Toolbox',
            Path: '/tenant-setting/form/kobotoolbox.svg#icon',
            Icon: 'Please select the KoboToolbox if you want to include in your forms setting'
        },
        ODK: {
            Name: 'ODK',
            Path: '/tenant-setting/form/kobotoolbox.svg#icon',
            Icon: 'Please select the ODK if you want to include in your forms setting'
        },
        GoogleForms: {
            Name: 'Google Forms',
            Path: '/tenant-setting/form/kobotoolbox.svg#icon',
            Icon: 'Please select the Google Forms if you want to include in your forms setting'
        },
    },
    OfflineSupport: {
        Name: 'OfflineSupport',
        Path: '/tenant-setting/forms/google-forms.svg#icon',
        Icon: 'Please select the Google Forms if you want to include in your forms setting'
    },
    FieldApp: {
        Name: 'FieldApp',
        Path: '/tenant-setting/forms/google-forms.svg#icon',
        Icon: 'Please select the Google Forms if you want to include in your forms setting'
    }
}