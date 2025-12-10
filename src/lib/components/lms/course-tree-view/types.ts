export type CourseTreeViewMode = 'courses' | 'modules';

export type Course = {
	id: string;
	Name?: string;
	name?: string;
	Modules?: Array<any>;
};

export type Module = {
	id: string;
	Name?: string;
	name?: string;
	Sequence?: number;
	Description?: string;
	DurationInMins?: number;
	ParentModuleId?: string | null;
	Children?: Array<Module>;
	CourseId?: string;
	courseId?: string;
};

export type Content = {
	id: string;
	Title?: string;
	title?: string;
	Sequence?: number;
	Description?: string;
	DurationInMins?: number;
	ContentType?: string;
	CourseModuleId?: string;
	courseModuleId?: string;
	ModuleId?: string;
};

export type ModuleViewFunction = 
	| ((courseId: string, moduleId: string) => string)
	| ((moduleId: string) => string);

export type ContentViewFunction = 
	| ((courseId: string, moduleId: string, contentId: string) => string)
	| ((contentId: string, moduleId?: string) => string);

export interface CourseTreeViewProps {
	mode?: CourseTreeViewMode;
	courses?: Course[];
	modules?: Module[];
	courseView?: (courseId: string) => string;
	moduleView?: ModuleViewFunction;
	contentView?: ContentViewFunction;
	expandedCourses?: Record<string, boolean>;
	expandedModules?: Record<string, boolean>;
	moduleContents?: Record<string, Content[]>;
	loadingContents?: Record<string, boolean>;
	courseModules?: Record<string, Module[]>;
	loadingModules?: Record<string, boolean>;
	courseId?: string;
}

