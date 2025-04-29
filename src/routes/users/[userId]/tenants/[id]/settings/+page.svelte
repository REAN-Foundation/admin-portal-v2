<script lang="ts">
    import FormSetting from '$lib/components/tenant-settings/forms.svelte';
    import CommonSetting from '$lib/components/tenant-settings/common-setting.svelte';
    import PatientAppSetting from '$lib/components/tenant-settings/patient-app.svelte';
    import ChatBotSetting from '$lib/components/tenant-settings/chat-bot.svelte';
    import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
    // import { resetChatBotSettings, resetCommonSettings, resetFormsSettings, resetPatientAppSettings } from './setting';
    import { page } from '$app/stores';
    import Icon from '@iconify/svelte';
    import { goto } from '$app/navigation';
    import type { PageServerData } from './$types';
    import type { TenantSettings } from '$lib/types/tenant.settings.types';
    // import { uploadAppoinmentPdf } from '$routes/api/services/gmu/appointment-upload';
    // import { number } from 'zod';
   
    /////////////////////////////////////////////////////////////////////////
    
    $:integrationSettings = {
            PatientInterface: false,
            ChatBotInterface: false,
            FormsInterface: false
        }
    

    const userId = $page.params.userId;
	const tenantId = $page.params.id;
    const viewRoute = `/users/${userId}/tenants/${tenantId}/view`;
	const tenantRoute = `/users/${userId}/tenants`;

	const breadCrumbs = [
		{
			name: 'Tenants',
			path: tenantRoute
		},
		{
			name: 'Settings',
			path: viewRoute
		}
	];
    let disabled = false;

    $: edit = disabled;
    const id = $page.params.id;
    export let data: PageServerData;
    $:createSetting = data.settings.TenantId ? 0 : 1;
    // data.settings.ChatBot = JSON.parse(data.settings.ChatBot);
    const integrations = [];
    let isPatientAppChecked = false;
    let isChatbotChecked = false;
    let isFormsChecked = false;

    $:{
        console.log('isPatientAppChecked', isPatientAppChecked);
        console.log('isChatbotChecked', isChatbotChecked);
        console.log('isFormsChecked', isFormsChecked);
    }
    let commonSettingOptions = {
        isVitalsChecked : false,
        isLabRecordsChecked : false,
        isSymptomsChecked : false,
        isDrugManagementsChecked : false,
        isMedicationsChecked : false,
        isCareplansChecked : false,
        isAssessmentsChecked : false,
        isFhirStoragesChecked : false,
        isEHRIntegrationsChecked : false,
        isABDMIntegrationsChecked : false,
        isHospitalSystemsChecked : false,
        isGamificationsChecked : false,
        isLearningJourneysChecked : false,
        isCommunityChecked : false,
        isPatientSelfServicePortalsChecked : false,
        isPatientStatusReportsChecked : false,
        isDocumentManagementsChecked : false,
        isAppointmentRemindersChecked : false,
        isOrganizationsChecked : false,
        isCohortsChecked : false,
        isNotificationsChecked : false,
        isNewsfeedsChecked : false,
        isNoticesChecked : false,
        isCustomQueriesChecked : false,
        isQuicksightsChecked : false,
	};
    $ : console.log('Change in Common settings',commonSettingOptions);

    let patientAppSettingOptions = {
        isTerrachecked : false,
        isSenseSemichecked : false,
        isExerciseschecked : false,
        isNutritionschecked : false,
    }

    let chatBotSettingOptions = {
        name: '',
        icon : '',
        description: '',
        defaultLanguage: '',
        isEmailchecked : false,
        isClickUpchecked : false,
        isSlackchecked : false,
        isWhatsAppchecked : false,
        isTelegramchecked : false,
        isLocalizationContextualQuerieschecked : false,
        isLocalizationSupportchecked : false,
        isChatPersonlizationchecked : false,
        triggerFhirApiUrl : '',
        triggerFhirApiUsername :'',
        triggerFhirApiPassword :'',
        triggerCustomApiUrl : '',
        triggerCustomApiUsername : '',
        triggerCustomApiPassword : '',
        scheduleReminderTime : '',
        weekDay : '',
        selectedDayOfMonth : 1,
        uploadAppointmentPDF : false,
        useAppointmentEHRAPI : false,
        integrateWithCustomAPI :false, 
        integrateWithFhirAPI : false,
        scheduleDaily : false,
        scheduleWeekly : false,
        scheduleMonthly : false,
        hourBefore : false,
        dayBefore : false,
        weekBefore : false,
        isManualchecked : false,
        isScheduleTriggerchecked : false, 
        followUpMessageschecked : false,
    }

    $ : console.log('Change in chat bot settings',chatBotSettingOptions);
    let formSettingOptions = {
        iskoboToolboxchecked : false,
        isodkchecked : false,
        isgoogleFormschecked : false,
        isofflineSupportchecked : false,
        isfieldAppchecked : false,
    }


   if (data.settings) {
        isPatientAppChecked = data.settings.UserInterfaces.PatientApp,
        isChatbotChecked = data.settings.UserInterfaces.ChatBot,
        isFormsChecked = data.settings.UserInterfaces.Forms,
        
        commonSettingOptions.isVitalsChecked = data.settings.Common.Clinical.Vitals;
        commonSettingOptions.isLabRecordsChecked = data.settings.Common.Clinical.LabRecords;
        commonSettingOptions.isSymptomsChecked = data.settings.Common.Clinical.Symptoms;
        commonSettingOptions.isDrugManagementsChecked = data.settings.Common.Clinical.DrugsManagement;
        commonSettingOptions.isMedicationsChecked = data.settings.Common.Clinical.Medications;
        commonSettingOptions.isCareplansChecked = data.settings.Common.Clinical.Careplans;
        commonSettingOptions.isAssessmentsChecked = data.settings.Common.Clinical.Assessments;

        commonSettingOptions.isFhirStoragesChecked = data.settings.Common.External.FHIRStorage;
        commonSettingOptions.isEHRIntegrationsChecked = data.settings.Common.External.EHRIntegration;
        commonSettingOptions.isABDMIntegrationsChecked = data.settings.Common.External.ABDMIntegration;
        
        commonSettingOptions.isHospitalSystemsChecked = data.settings.Common.AddOns.HospitalSystems;
        commonSettingOptions.isGamificationsChecked = data.settings.Common.AddOns.Gamification;
        commonSettingOptions.isLearningJourneysChecked = data.settings.Common.AddOns.LearningJourney;
        commonSettingOptions.isCommunityChecked = data.settings.Common.AddOns.Community;
        commonSettingOptions.isPatientSelfServicePortalsChecked = data.settings.Common.AddOns.PatientSelfServicePortal;
        commonSettingOptions.isPatientStatusReportsChecked = data.settings.Common.AddOns.PatientStatusReports;
        commonSettingOptions.isDocumentManagementsChecked = data.settings.Common.AddOns.DocumentsManagement;
        commonSettingOptions.isAppointmentRemindersChecked = data.settings.Common.AddOns.AppointmentReminders;
        commonSettingOptions.isOrganizationsChecked = data.settings.Common.AddOns.Organizations;
        commonSettingOptions.isCohortsChecked = data.settings.Common.AddOns.Cohorts;
        commonSettingOptions.isNotificationsChecked = data.settings.Common.AddOns.Notifications;
        commonSettingOptions.isNewsfeedsChecked = data.settings.Common.AddOns.Newsfeeds;
        commonSettingOptions.isNoticesChecked = data.settings.Common.AddOns.Notices;
        commonSettingOptions.isCustomQueriesChecked = data.settings.Common.Analysis.CustomQueries;
        commonSettingOptions.isQuicksightsChecked = data.settings.Common.Analysis.Quicksight;

        patientAppSettingOptions.isExerciseschecked = data.settings.PatientApp.Exercise;
        patientAppSettingOptions.isNutritionschecked = data.settings.PatientApp.Nutrition;
        patientAppSettingOptions.isTerrachecked = data.settings.PatientApp.DeviceIntegration.Terra;
        patientAppSettingOptions.isSenseSemichecked = data.settings.PatientApp.DeviceIntegration.SenseSemi;

        chatBotSettingOptions.name = data.settings.ChatBot.Name;
        chatBotSettingOptions.icon = data.settings.ChatBot.Icon;
        chatBotSettingOptions.description = data.settings.ChatBot.Description;
        chatBotSettingOptions.defaultLanguage = data.settings.ChatBot.DefaultLanguage;
        chatBotSettingOptions.isWhatsAppchecked = data.settings.ChatBot.MessageChannels.WhatsApp;
        chatBotSettingOptions.isTelegramchecked = data.settings.ChatBot.MessageChannels.Telegram;
        chatBotSettingOptions.isClickUpchecked = data.settings.ChatBot.SupportChannels.ClickUp;
        chatBotSettingOptions.isSlackchecked = data.settings.ChatBot.SupportChannels.Slack;
        chatBotSettingOptions.isEmailchecked = data.settings.ChatBot.SupportChannels.Email;
        chatBotSettingOptions.isChatPersonlizationchecked = data.settings.ChatBot.Personalization;
        chatBotSettingOptions.isLocalizationContextualQuerieschecked = data.settings.ChatBot.LocationContext;
        chatBotSettingOptions.isLocalizationSupportchecked = data.settings.ChatBot.Localization;
 
        chatBotSettingOptions.uploadAppointmentPDF = data.settings.ChatBot.AppointmentFollowup.UploadAppointmentDocument;
        chatBotSettingOptions.useAppointmentEHRAPI = data.settings.ChatBot.AppointmentFollowup.AppointmentEhrApi;
        chatBotSettingOptions.integrateWithCustomAPI = data.settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.CustomApi;
        chatBotSettingOptions.triggerCustomApiUrl = data.settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.CustomApiDetails.Url;
        chatBotSettingOptions.triggerCustomApiUsername = data.settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.CustomApiDetails.Credentials.UserName;
        chatBotSettingOptions.triggerCustomApiPassword = data.settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.CustomApiDetails.Credentials.Password;
        chatBotSettingOptions.integrateWithFhirAPI = data.settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FhirApi;
        chatBotSettingOptions.triggerFhirApiUrl = data.settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FhirApiDetails.Url;
        chatBotSettingOptions.triggerFhirApiUsername = data.settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FhirApiDetails.Credentials.UserName;
        chatBotSettingOptions.triggerFhirApiPassword = data.settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FhirApiDetails.Credentials.Password;
        chatBotSettingOptions.isManualchecked = data.settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FollowupMechanism.ManualTrigger;
        chatBotSettingOptions.isScheduleTriggerchecked = data.settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FollowupMechanism.ScheduleTrigger;
        chatBotSettingOptions.scheduleDaily = data.settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FollowupMechanism.ScheduleFrequency.Daily;
        chatBotSettingOptions.scheduleWeekly = data.settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FollowupMechanism.ScheduleFrequency.Weekly;
        chatBotSettingOptions.scheduleMonthly = data.settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FollowupMechanism.ScheduleFrequency.Monthly;
        chatBotSettingOptions.hourBefore = data.settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FollowupMechanism.MessageFrequency.OneHourBefore;
        chatBotSettingOptions.dayBefore= data.settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FollowupMechanism.MessageFrequency.OneDayBefore;
        chatBotSettingOptions.weekBefore = data.settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FollowupMechanism.MessageFrequency.OneWeekBefore;
        chatBotSettingOptions.followUpMessageschecked = data.settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FollowupMechanism.FollowupMessages;
        chatBotSettingOptions.scheduleReminderTime = data.settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FollowupMechanism.ScheduleTiming;

        formSettingOptions.iskoboToolboxchecked = data.settings.Forms.Integrations.KoboToolbox
        formSettingOptions.isgoogleFormschecked = data.settings.Forms.Integrations.GoogleForm
        formSettingOptions.isodkchecked = data.settings.Forms.Integrations.ODK
        formSettingOptions.isofflineSupportchecked = data.settings.Forms.OfflineSupport
        formSettingOptions.isfieldAppchecked = data.settings.Forms.FieldApp

        disabled = true;
        edit = disabled;
    }

    let submit;
    let index = -1;
    $: initial = true;
    $: chatBotSetting = false;
    $: commonSetting = false;
    $: patientAppSetting = false;
    $: formSetting = false;

    function goToNextSetting(index) {
        if (index === -1) {
            initial = false;
            commonSetting = true;
        }
        if (index === 0) {
            commonSetting = false;
            patientAppSetting = true;
        }
        if (index === 1) {
            commonSetting = false;
            patientAppSetting = false;
            chatBotSetting = true;
        }
        if (index === 2) {
            commonSetting = false;
            patientAppSetting = false;
            chatBotSetting = false;
            formSetting = true;
        }
    }
    function setIntegrationOptions() {
       let submitCount = 0;
        if (isPatientAppChecked) {
            submitCount +=1;
        }
        if (isChatbotChecked) {
            submitCount +=1;
        }
        if (isFormsChecked) {
            submitCount +=1;
        }
        submit = submitCount
        integrations.push(isPatientAppChecked);
        integrations.push(isChatbotChecked);
        integrations.push(isFormsChecked);
        console.log('Integrations', integrations);
        console.log('Count', submitCount);
    }
    

    async function handleCreateTenantSettings() {
        const tenantId = id;
        const settings: TenantSettings = {};
    //     const settings =  {
    //     Integrations: {
    //         PatientInterface: false,
    //         ChatBotInterface: false,
    //         FormsInterface: false
    //     },
    //     Common: {
    //         VitalAndLabRecords: false,
    //         Nutrition:false,
    //         MedicationManagement:false,
    //         Reminders:false,
    //         ScheduledAssesments:false,
    //         ExcerciseAndFitness:false,
    //         FHIRResourceStorage:false,
    //         Careplans: {
    //             Default:false,
    //             Custom:false
    //         },
    //         EHIRIntegrations:false,
    //         ABDMIntegrations:false,
    //         DocumentManagement:false
    //     },
    //     PatientInterface: {
    //         GamificationAndAwards:false,
    //         CoursesAndLearningJourneys:false,
    //         CommunityAndUserGroups:false,
    //         AppointmentsAndVisits:false,
    //         DeviceIntegration: {
    //             Terra:false,
    //             SenseSemi:false
    //         },
    //         PatientReports: {
    //             Default:false,
    //             Custom:false
    //         }
    //     },
    //     ChatBotInterface: {
    //         FAQ: {
    //             Default:false,
    //            Custom:false
    //         },
    //         Integrations: {
    //             ClickUp:false,
    //            Slack:false
    //         },
    //         WhatsApp:false,
    //        Telegram:false,
    //        QuicksightDashboard:false,
    //        ChatPersonalization:false,
    //        CustomUserDBQueries:false,
    //        LocationContextualQueries:false,
    //        LocalizationSupport:false
    //     },
    //     FormsInterface: {
    //         Integrations: {
    //             KoboToolbox:false,
    //             ODK:false,
    //             GoogleForm:false
    //         },
    //         OfflineSupport:false,
    //         FieldApp:false
    //     }
    // }
        settings.UserInterfaces.PatientApp = isPatientAppChecked,
        settings.UserInterfaces.ChatBot = isChatbotChecked,
        settings.UserInterfaces.Forms = isFormsChecked,

        settings.Common.Clinical.Vitals = commonSettingOptions.isVitalsChecked;
        settings.Common.Clinical.LabRecords = commonSettingOptions.isLabRecordsChecked;
        settings.Common.Clinical.Symptoms = commonSettingOptions.isSymptomsChecked;
        settings.Common.Clinical.DrugsManagement = commonSettingOptions.isDrugManagementsChecked;
        settings.Common.Clinical.Medications = commonSettingOptions.isMedicationsChecked;
        settings.Common.Clinical.Careplans = commonSettingOptions.isCareplansChecked;
        settings.Common.Clinical.Assessments = commonSettingOptions.isAssessmentsChecked;

        settings.Common.External.FHIRStorage = commonSettingOptions.isFhirStoragesChecked;
        settings.Common.External.EHRIntegration = commonSettingOptions.isEHRIntegrationsChecked;
        settings.Common.External.ABDMIntegration = commonSettingOptions.isABDMIntegrationsChecked;
        
        settings.Common.AddOns.HospitalSystems = commonSettingOptions.isHospitalSystemsChecked;
        settings.Common.AddOns.Gamification = commonSettingOptions.isGamificationsChecked;
        settings.Common.AddOns.LearningJourney = commonSettingOptions.isLearningJourneysChecked;
        settings.Common.AddOns.Community = commonSettingOptions.isCommunityChecked;
        settings.Common.AddOns.PatientSelfServicePortal = commonSettingOptions.isPatientSelfServicePortalsChecked;
        settings.Common.AddOns.PatientStatusReports = commonSettingOptions.isPatientStatusReportsChecked;
        settings.Common.AddOns.DocumentsManagement = commonSettingOptions.isDocumentManagementsChecked;
        settings.Common.AddOns.AppointmentReminders = commonSettingOptions.isAppointmentRemindersChecked;
        settings.Common.AddOns.Organizations = commonSettingOptions.isOrganizationsChecked;
        settings.Common.AddOns.Cohorts = commonSettingOptions.isCohortsChecked;
        settings.Common.AddOns.Notifications = commonSettingOptions.isNoticesChecked;
        settings.Common.AddOns.Newsfeeds = commonSettingOptions.isNewsfeedsChecked;
        settings.Common.AddOns.Notices = commonSettingOptions.isNoticesChecked;

        settings.Common.Analysis.CustomQueries = commonSettingOptions.isCustomQueriesChecked;
        settings.Common.Analysis.Quicksight = commonSettingOptions.isQuicksightsChecked;

        settings.PatientApp.Exercise = patientAppSettingOptions.isExerciseschecked;
        settings.PatientApp.Nutrition = patientAppSettingOptions.isNutritionschecked;
        settings.PatientApp.DeviceIntegration.Terra = patientAppSettingOptions.isTerrachecked;
        settings.PatientApp.DeviceIntegration.SenseSemi = patientAppSettingOptions.isSenseSemichecked;
        
        settings.ChatBot.Name = chatBotSettingOptions.name;
        settings.ChatBot.Icon = chatBotSettingOptions.icon;
        settings.ChatBot.Description = chatBotSettingOptions.description;
        settings.ChatBot.DefaultLanguage = chatBotSettingOptions.defaultLanguage;
        settings.ChatBot.MessageChannels.WhatsApp = chatBotSettingOptions.isWhatsAppchecked;
        settings.ChatBot.MessageChannels.Telegram = chatBotSettingOptions.isTelegramchecked;
        settings.ChatBot.SupportChannels.ClickUp = chatBotSettingOptions.isClickUpchecked;
        settings.ChatBot.SupportChannels.Slack = chatBotSettingOptions.isSlackchecked;
        settings.ChatBot.SupportChannels.Email = chatBotSettingOptions.isEmailchecked;
        settings.ChatBot.Personalization = chatBotSettingOptions.isChatPersonlizationchecked;
        settings.ChatBot.LocationContext = chatBotSettingOptions.isLocalizationContextualQuerieschecked;
        settings.ChatBot.Localization = chatBotSettingOptions.isLocalizationSupportchecked;
        settings.ChatBot.AppointmentFollowup.UploadAppointmentDocument = chatBotSettingOptions.uploadAppointmentPDF;
        settings.ChatBot.AppointmentFollowup.AppointmentEhrApi = chatBotSettingOptions.useAppointmentEHRAPI;
        settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.CustomApi= chatBotSettingOptions.integrateWithCustomAPI;
        settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FhirApi = chatBotSettingOptions.integrateWithFhirAPI;
        settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FollowupMechanism.ManualTrigger = chatBotSettingOptions.isManualchecked;
        settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FollowupMechanism.ScheduleTrigger = chatBotSettingOptions.isScheduleTriggerchecked ;
        settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.CustomApiDetails.Url = chatBotSettingOptions.triggerCustomApiUrl;
        settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.CustomApiDetails.Credentials.UserName = chatBotSettingOptions.triggerCustomApiUsername;
        settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.CustomApiDetails.Credentials.Password = chatBotSettingOptions.triggerCustomApiPassword;
        settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FhirApiDetails.Url = chatBotSettingOptions.triggerFhirApiUrl;
        settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FhirApiDetails.Credentials.UserName = chatBotSettingOptions.triggerFhirApiUsername;
        settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FhirApiDetails.Credentials.Password = chatBotSettingOptions.triggerFhirApiPassword;
        settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FollowupMechanism.ScheduleFrequency.Daily = chatBotSettingOptions.scheduleDaily;
        settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FollowupMechanism.ScheduleFrequency.Weekly = chatBotSettingOptions.scheduleWeekly;
        settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FollowupMechanism.ScheduleFrequency.Monthly = chatBotSettingOptions.scheduleMonthly;
        settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FollowupMechanism.ScheduleFrequency.DayOfMonth = chatBotSettingOptions.selectedDayOfMonth;
        settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FollowupMechanism.ScheduleFrequency.WeekDay = chatBotSettingOptions.weekDay;
        settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FollowupMechanism.ScheduleTiming = chatBotSettingOptions.scheduleReminderTime;
        settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FollowupMechanism.MessageFrequency.OneHourBefore = chatBotSettingOptions.hourBefore;
        settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FollowupMechanism.MessageFrequency.OneDayBefore= chatBotSettingOptions.dayBefore;
        settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FollowupMechanism.MessageFrequency.OneWeekBefore = chatBotSettingOptions.weekBefore;
        settings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FollowupMechanism.FollowupMessages = chatBotSettingOptions.followUpMessageschecked;


        settings.Forms.Integrations.KoboToolbox = formSettingOptions.iskoboToolboxchecked;
        settings.Forms.Integrations.GoogleForm = formSettingOptions.isgoogleFormschecked;
        settings.Forms.Integrations.ODK = formSettingOptions.isodkchecked;
        settings.Forms.OfflineSupport = formSettingOptions.isofflineSupportchecked;
        settings.Forms.FieldApp = formSettingOptions.isfieldAppchecked;
        
        // settings.Common.VitalAndLabRecords = commonSettingOptions.isVitalsAndLabRecordsChecked;
        // settings.Common.Nutrition = commonSettingOptions.isNutritionChecked;
        // settings.Common.MedicationManagement = commonSettingOptions.isMedicationManagementChecked;
        // settings.Common.Reminders = commonSettingOptions.isRemindersChecked;
        // settings.Common.ScheduledAssesments = commonSettingOptions.isScheduledAssessmentsChecked;
        // settings.Common.ExcerciseAndFitness = commonSettingOptions.isExerciseAndFitnessChecked;
        // settings.Common.FHIRResourceStorage = commonSettingOptions.isFHIRResourceStorageChecked;
        // settings.Common.Careplans.Default = commonSettingOptions.isDefaultCareplanChecked;
        // settings.Common.Careplans.Custom = commonSettingOptions.isCustomCareplanChecked;
        // settings.Common.EHIRIntegrations = commonSettingOptions.isEHRIntegrationsChecked;
        // settings.Common.ABDMIntegrations = commonSettingOptions.isABDMIntegrationChecked;
        // settings.Common.DocumentManagement = commonSettingOptions.isDocumentManagementChecked;

        // settings.PatientInterface.GamificationAndAwards = patientAppSettingOptions.isGamificationAndAwardschecked;
        // settings.PatientInterface.CoursesAndLearningJourneys = patientAppSettingOptions.isCoursesAndLearningJourneyschecked;
        // settings.PatientInterface.CommunityAndUserGroups = patientAppSettingOptions.isCommunityAndUserGroupschecked;
        // settings.PatientInterface.AppointmentsAndVisits = patientAppSettingOptions.isAppointmentsAndVisitschecked;
        // settings.PatientInterface.DeviceIntegration.Terra = patientAppSettingOptions.isTerrachecked;
        // settings.PatientInterface.DeviceIntegration.SenseSemi = patientAppSettingOptions.isSenseSemichecked;
        // settings.PatientInterface.PatientReports.Default = patientAppSettingOptions.isDefaultchecked;
        // settings.PatientInterface.PatientReports.Custom = patientAppSettingOptions.isCustomchecked;

        // settings.ChatBotInterface.FAQ.Default = chatBotSettingOptions.isDefaultchecked;
        // settings.ChatBotInterface.FAQ.Custom = chatBotSettingOptions.isCustomchecked;
        // settings.ChatBotInterface.Integrations.ClickUp = chatBotSettingOptions.isClickUpchecked;
        // settings.ChatBotInterface.QuicksightDashboard = chatBotSettingOptions.isQuicksightDashboardchecked;
        // settings.ChatBotInterface.LocalizationSupport = chatBotSettingOptions.isLocalizationSupportchecked;
        // settings.ChatBotInterface.WhatsApp = chatBotSettingOptions.isWhatsAppchecked;
        // settings.ChatBotInterface.Telegram = chatBotSettingOptions.isTelegramchecked;
        // settings.ChatBotInterface.Integrations.Slack = chatBotSettingOptions.isSlackchecked;
        // settings.ChatBotInterface.ChatPersonalization = chatBotSettingOptions.isChatPersonlizationchecked;
        // settings.ChatBotInterface.CustomUserDBQueries = chatBotSettingOptions.isCustomUserDBQuerieschecked;
        // settings.ChatBotInterface.LocationContextualQueries = chatBotSettingOptions.isLocalizationContextualQuerieschecked;

        // settings.FormsInterface.Integrations.KoboToolbox = formSettingOptions.iskoboToolboxchecked
        // settings.FormsInterface.Integrations.ODK = formSettingOptions.isodkchecked
        // settings.FormsInterface.Integrations.GoogleForm = formSettingOptions.isgoogleFormschecked
        // settings.FormsInterface.OfflineSupport = formSettingOptions.isofflineSupportchecked
        // settings.FormsInterface.FieldApp = formSettingOptions.isfieldAppchecked

        await Create({
            sessionId: data.sessionId,
            tenantId,
            settings
        });
        goto(`/users/${userId}/tenants/${id}/view`)
    }

    async function handleUpdateTenantSettings() {
        console.log('handledUpdateTenantSettings() get called.....');
        const updatedSettings: TenantSettings = {
            UserInterfaces : {
                PatientApp: false,
                ChatBot: false,
                Forms: false
            },

            Common: {
                Clinical: {
                    Vitals: false,
                    LabRecords: false,
                    Symptoms: false,
                    DrugsManagement: false,
                    Medications: false,
                    Careplans: false,
                    Assessments: false,
                },
                External: {
                    FHIRStorage: false,
                    EHRIntegration: false,
                    ABDMIntegration: false,
                },
                AddOns: {
                    HospitalSystems: false,
                    Gamification: false,
                    LearningJourney: false,
                    Community: false,
                    PatientSelfServicePortal: false,
                    PatientStatusReports: false,
                    DocumentsManagement: false,
                    AppointmentReminders: false,
                    Organizations: false,
                    Cohorts: false,
                    Notifications: false,
                    Newsfeeds: false,
                    Notices: false,
                },
                Analysis: {
                    CustomQueries: false,
                    Quicksight: false,
                }  
            },

            PatientApp :{
                Exercise: false,
                Nutrition: false,
                DeviceIntegration: {
                    Terra: false,
                    SenseSemi: false
                }
            },

            ChatBot: {
                Name: 'Chatbot',
                Icon: '',
                Description: 'Chatbot for patient interaction', 
                DefaultLanguage: 'en',
                MessageChannels: {
                    WhatsApp: false,
                    Telegram: false,
                },
                SupportChannels: {
                    ClickUp: false,
                    Slack: false,
                    Email: false,
                },
                Personalization: false,
                LocationContext: false,
                Localization: false, 
                AppointmentFollowup: {
                    UploadAppointmentDocument: false,
                    AppointmentEhrApi: true,
                    AppointmentEhrApiDetails: {
                        CustomApi: false,
                        FhirApi: false,
                        CustomApiDetails: {
                            Url: null,
                            Credentials: {
                                UserName: null,
                                Password: null
                            }
                        },
                        FhirApiDetails: {
                            Url: null,
                            Credentials: {
                                UserName: null,
                                Password: null
                            }
                        },
                        FollowupMechanism: {
                            ManualTrigger: false,
                            ScheduleTrigger: true,
                            ScheduleFrequency: {
                                Daily: true,
                                Weekly: false,
                                WeekDay: "Monday",
                                Monthly: false,
                                DayOfMonth: 1
                            },
                            ScheduleTiming: null,
                            FollowupMessages: false,
                            MessageFrequency: {
                                OneDayBefore: false,
                                OneHourBefore: false,
                                OneWeekBefore: false
                            }
                        }
                    }
        
    },

            },
            
            Forms: {
                Integrations: {
                    KoboToolbox: false,
                    GoogleForm: false,
                    ODK: false,
                },
                OfflineSupport: false,
                FieldApp: false,               
            }

        };

        console.log('DEFALT SETTINGS',updatedSettings);   

        updatedSettings.UserInterfaces.PatientApp = isPatientAppChecked,
        updatedSettings.UserInterfaces.ChatBot = isChatbotChecked,
        updatedSettings.UserInterfaces.Forms = isFormsChecked,

        updatedSettings.Common.Clinical.Vitals = commonSettingOptions.isVitalsChecked;
        updatedSettings.Common.Clinical.LabRecords = commonSettingOptions.isLabRecordsChecked;
        updatedSettings.Common.Clinical.Symptoms = commonSettingOptions.isSymptomsChecked;
        updatedSettings.Common.Clinical.DrugsManagement = commonSettingOptions.isDrugManagementsChecked;
        updatedSettings.Common.Clinical.Medications = commonSettingOptions.isMedicationsChecked;
        updatedSettings.Common.Clinical.Careplans = commonSettingOptions.isCareplansChecked;
        updatedSettings.Common.Clinical.Assessments = commonSettingOptions.isAssessmentsChecked;

        updatedSettings.Common.External.FHIRStorage = commonSettingOptions.isFhirStoragesChecked;
        updatedSettings.Common.External.EHRIntegration = commonSettingOptions.isEHRIntegrationsChecked;
        updatedSettings.Common.External.ABDMIntegration = commonSettingOptions.isABDMIntegrationsChecked;
        
        updatedSettings.Common.AddOns.HospitalSystems = commonSettingOptions.isHospitalSystemsChecked;
        updatedSettings.Common.AddOns.Gamification = commonSettingOptions.isGamificationsChecked;
        updatedSettings.Common.AddOns.LearningJourney = commonSettingOptions.isLearningJourneysChecked;
        updatedSettings.Common.AddOns.Community = commonSettingOptions.isCommunityChecked;
        updatedSettings.Common.AddOns.PatientSelfServicePortal = commonSettingOptions.isPatientSelfServicePortalsChecked;
        updatedSettings.Common.AddOns.PatientStatusReports = commonSettingOptions.isPatientStatusReportsChecked;
        updatedSettings.Common.AddOns.DocumentsManagement = commonSettingOptions.isDocumentManagementsChecked;
        updatedSettings.Common.AddOns.AppointmentReminders = commonSettingOptions.isAppointmentRemindersChecked;
        updatedSettings.Common.AddOns.Organizations = commonSettingOptions.isOrganizationsChecked;
        updatedSettings.Common.AddOns.Cohorts = commonSettingOptions.isCohortsChecked;
        updatedSettings.Common.AddOns.Notifications = commonSettingOptions.isNoticesChecked;
        updatedSettings.Common.AddOns.Newsfeeds = commonSettingOptions.isNewsfeedsChecked;
        updatedSettings.Common.AddOns.Notices = commonSettingOptions.isNoticesChecked;

        updatedSettings.Common.Analysis.CustomQueries = commonSettingOptions.isCustomQueriesChecked;
        updatedSettings.Common.Analysis.Quicksight = commonSettingOptions.isQuicksightsChecked;

        if (updatedSettings.UserInterfaces.PatientApp) {
            updatedSettings.PatientApp.Exercise = patientAppSettingOptions.isExerciseschecked;
            updatedSettings.PatientApp.Nutrition = patientAppSettingOptions.isNutritionschecked;
            updatedSettings.PatientApp.DeviceIntegration.Terra = patientAppSettingOptions.isTerrachecked;
            updatedSettings.PatientApp.DeviceIntegration.SenseSemi = patientAppSettingOptions.isSenseSemichecked;
        }
                   
        if (updatedSettings.UserInterfaces.ChatBot) {
            updatedSettings.ChatBot.Name = chatBotSettingOptions.name;
            updatedSettings.ChatBot.Icon = chatBotSettingOptions.icon;
            updatedSettings.ChatBot.Description = chatBotSettingOptions.description;
            updatedSettings.ChatBot.DefaultLanguage = chatBotSettingOptions.defaultLanguage;
            updatedSettings.ChatBot.MessageChannels.WhatsApp = chatBotSettingOptions.isWhatsAppchecked;
            updatedSettings.ChatBot.MessageChannels.Telegram = chatBotSettingOptions.isTelegramchecked;
            updatedSettings.ChatBot.SupportChannels.ClickUp = chatBotSettingOptions.isClickUpchecked;
            updatedSettings.ChatBot.SupportChannels.Slack = chatBotSettingOptions.isSlackchecked;
            updatedSettings.ChatBot.SupportChannels.Email = chatBotSettingOptions.isEmailchecked;
            updatedSettings.ChatBot.Personalization = chatBotSettingOptions.isChatPersonlizationchecked;
            updatedSettings.ChatBot.LocationContext = chatBotSettingOptions.isLocalizationContextualQuerieschecked;
            updatedSettings.ChatBot.Localization = chatBotSettingOptions.isLocalizationSupportchecked;
            updatedSettings.ChatBot.AppointmentFollowup.UploadAppointmentDocument = chatBotSettingOptions.uploadAppointmentPDF;
            updatedSettings.ChatBot.AppointmentFollowup.AppointmentEhrApi = chatBotSettingOptions.useAppointmentEHRAPI;
            updatedSettings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.CustomApi = chatBotSettingOptions.integrateWithCustomAPI;
            updatedSettings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FhirApi = chatBotSettingOptions.integrateWithFhirAPI;
            updatedSettings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.CustomApiDetails.Url = chatBotSettingOptions.triggerCustomApiUrl;
            updatedSettings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.CustomApiDetails.Credentials.UserName = chatBotSettingOptions.triggerCustomApiUsername;
            updatedSettings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.CustomApiDetails.Credentials.Password = chatBotSettingOptions.triggerCustomApiPassword;
            updatedSettings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FhirApiDetails.Url = chatBotSettingOptions.triggerFhirApiUrl;
            updatedSettings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FhirApiDetails.Credentials.UserName = chatBotSettingOptions.triggerFhirApiUsername;
            updatedSettings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FhirApiDetails.Credentials.Password = chatBotSettingOptions.triggerFhirApiPassword;
            updatedSettings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FollowupMechanism.ManualTrigger = chatBotSettingOptions.isManualchecked;
            updatedSettings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FollowupMechanism.ScheduleTrigger = chatBotSettingOptions.isScheduleTriggerchecked;
            updatedSettings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FollowupMechanism.ScheduleFrequency.Daily = chatBotSettingOptions.scheduleDaily;
            updatedSettings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FollowupMechanism.ScheduleFrequency.Weekly = chatBotSettingOptions.scheduleWeekly;
            updatedSettings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FollowupMechanism.ScheduleFrequency.Monthly = chatBotSettingOptions.scheduleMonthly;
            updatedSettings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FollowupMechanism.ScheduleFrequency.DayOfMonth = chatBotSettingOptions.selectedDayOfMonth;
            updatedSettings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FollowupMechanism.ScheduleFrequency.WeekDay = chatBotSettingOptions.weekDay;
            updatedSettings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FollowupMechanism.ScheduleTiming = chatBotSettingOptions.scheduleReminderTime;
            updatedSettings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FollowupMechanism.FollowupMessages = chatBotSettingOptions.followUpMessageschecked;
            updatedSettings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FollowupMechanism.MessageFrequency.OneDayBefore = chatBotSettingOptions.dayBefore;
            updatedSettings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FollowupMechanism.MessageFrequency.OneHourBefore = chatBotSettingOptions.hourBefore;
            updatedSettings.ChatBot.AppointmentFollowup.AppointmentEhrApiDetails.FollowupMechanism.MessageFrequency.OneWeekBefore = chatBotSettingOptions.weekBefore;
        }
        
        if (updatedSettings.UserInterfaces.Forms) {
            updatedSettings.Forms.Integrations.KoboToolbox = formSettingOptions.iskoboToolboxchecked;
            updatedSettings.Forms.Integrations.GoogleForm = formSettingOptions.isgoogleFormschecked;
            updatedSettings.Forms.Integrations.ODK = formSettingOptions.isodkchecked;
            updatedSettings.Forms.OfflineSupport = formSettingOptions.isofflineSupportchecked;
            updatedSettings.Forms.FieldApp = formSettingOptions.isfieldAppchecked;
        }
        console.log('DEFALT SETTINGS V1',updatedSettings); 
        await Update({
            sessionId: data.sessionId,
            tenantId,
            updatedSettings
        });
        goto(`/users/${userId}/tenants/${id}/view`)
    }

    async function Create(model) {
        console.log('Model',model)
		await fetch(`/api/server/tenant-settings/create?userId=${userId}`, {
			method: 'POST',
			body: JSON.stringify(model),
			headers: { 'content-type': 'application/json' }
		});
	}

    async function Update(model) {
        console.log('Model',model)
        if (edit == false) {
            await fetch(`/api/server/tenant-settings/update?userId=${userId}`, {
			method: 'PUT',
			body: JSON.stringify(model),
			headers: { 'content-type': 'application/json' }
		});
        }
	}
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="flex w-full flex-wrap justify-end gap-2 mb-2">
    <button class="btn variant-filled-secondary" on:click={() => {
        disabled = false;
        edit = disabled;
    }}>
		<Icon icon="material-symbols:edit-outline" />
		<span>Edit</span>
    </button>
</div>

<div>
{#if initial}
<table contenteditable = "false" class="table">
    <thead class="!variant-soft-secondary">
        <tr>
            <th>Integrations</th>
        </tr>
    </thead>
    <tbody class="!bg-white dark:!bg-inherit flex flex-col w-[1183px]">
        <tr class="!border-b !border-b-secondary-100 dark:!border-b-surface-700">
            <td>
              {#if edit === true && isPatientAppChecked === true}
                <span class="tick text-green-500 ml-10">✔</span>
              {:else}
                <input
                    type="checkbox"
                    name="patientApp"
                    disabled = {disabled}
                    bind:checked={isPatientAppChecked}
                    class="ml-10 checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md"
                />
              {/if}
               </td>
            <td class="ml-4">Patient App</td>
        </tr>
        <tr class="!bg-white !border-b !border-b-secondary-100 dark:!border-b-surface-700">
            <td>
                {#if edit === true && isChatbotChecked === true}
                    <span class="tick text-green-500 ml-10">✔</span>
                {:else}
                    <input
                        type="checkbox"
                        name="chatBot"
                        disabled = {disabled}
                        bind:checked={isChatbotChecked}
                        class="ml-10 checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md"
                    />
                {/if}
                
            </td>
            <td class="ml-4">Chat bot</td>
        </tr>
        <tr class="!bg-white !border-b !border-b-secondary-100 dark:!border-b-surface-700">
            <td>
                {#if edit === true && isFormsChecked === true}
                    <span class="tick text-green-500 ml-10">✔</span>
                {:else}
                    <input
                        type="checkbox"
                        name="form"
                        disabled = {disabled}
                        bind:checked={isFormsChecked}
                        class="ml-10 checkbox checkbox-primary border-primary-200 hover:border-primary-400 checkbox-md"
                    />
                {/if}
                
            </td>
            <td class="ml-4">Forms</td>
        </tr>
    </tbody>
</table>
{/if}

{#if commonSetting}
    <CommonSetting bind:commonSettingOptions {...commonSettingOptions} {edit}  />
{/if}

{#if patientAppSetting}
    <PatientAppSetting bind:patientAppSettingOptions {...patientAppSettingOptions} {edit}/>
{/if}

{#if chatBotSetting}
    <ChatBotSetting bind:chatBotSettingOptions {...chatBotSettingOptions} {edit}/>
{/if}

{#if formSetting}
    <FormSetting bind:formSettingOptions {...formSettingOptions} {edit}/>
{/if}

</div>
    <div class="flex p-2 justify-end">
        <button class="btn variant-filled-secondary" disabled={isPatientAppChecked ? false :(isChatbotChecked ? false :(isFormsChecked ? false :true))} on:click={()=>{
            if (initial === true){
                setIntegrationOptions();
            }
            if (index === -1){
                goToNextSetting(index);
                index += 1;
            }else {
                if (integrations[0]) {
                    goToNextSetting(0);
                    integrations[0] = false;
                    submit -= 1;
                } else if (integrations[1]) {
                    goToNextSetting(1);
                    integrations[1] = false;
                    submit -= 1;
                } else if (integrations[2]) {
                    goToNextSetting(2);
                    integrations[2] = false;
                    submit -= 1;
                }else {
                    if (!createSetting) {
                        handleUpdateTenantSettings()
                    } else {
                        handleCreateTenantSettings()
                    }
                }
            }
        }}>{submit === 0 ? !createSetting ? "Update" : "Submit" : "Next"}</button>
</div>
