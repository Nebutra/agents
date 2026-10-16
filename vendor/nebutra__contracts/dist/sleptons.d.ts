import { z } from 'zod';

/**
 * Sleptons résumé content contract (v1).
 *
 * The résumé is the structured "track record" attached 1:1 to a Sleptons member
 * profile. It is stored as a JSON document (`sleptons_resumes.content`) and
 * validated against this schema on every write. Derived/query columns are
 * computed by the consumer (apps/sleptons), never stored inside `content`.
 *
 * Design source: docs/superpowers/specs/2026-09-07-sleptons-resume-system-design.md §3.
 * Lineage: adapted from the CVise `Profile` Zod model (legacy, archived 2026-09-07).
 */
declare const RESUME_CONTENT_VERSION: 1;
declare const ResumeLangSchema: z.ZodEnum<{
    ZH: "ZH";
    EN: "EN";
    MIX: "MIX";
}>;
type ResumeLang = z.infer<typeof ResumeLangSchema>;
declare const ResumePeriodSchema: z.ZodString;
declare const ResumeLinksSchema: z.ZodObject<{
    github: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    linkedin: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    twitter: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    personal: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
declare const ResumeBasicSchema: z.ZodObject<{
    name: z.ZodString;
    name_en: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodEmail>;
    phone: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodURL>;
    links: z.ZodOptional<z.ZodObject<{
        github: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        linkedin: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        twitter: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        personal: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const ResumeObjectiveSchema: z.ZodObject<{
    summary: z.ZodOptional<z.ZodString>;
    advantage_tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
declare const VentureStageSchema: z.ZodEnum<{
    idea: "idea";
    building: "building";
    launched: "launched";
    scaling: "scaling";
    exited: "exited";
    closed: "closed";
}>;
type VentureStage = z.infer<typeof VentureStageSchema>;
declare const ResumeVentureSchema: z.ZodObject<{
    name: z.ZodString;
    role: z.ZodOptional<z.ZodString>;
    period: z.ZodOptional<z.ZodString>;
    stage: z.ZodOptional<z.ZodEnum<{
        idea: "idea";
        building: "building";
        launched: "launched";
        scaling: "scaling";
        exited: "exited";
        closed: "closed";
    }>>;
    outcome: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodURL>;
    details: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
declare const ExperienceKindSchema: z.ZodEnum<{
    work: "work";
    campus: "campus";
    founder: "founder";
}>;
type ExperienceKind = z.infer<typeof ExperienceKindSchema>;
declare const ResumeExperienceSchema: z.ZodObject<{
    kind: z.ZodDefault<z.ZodEnum<{
        work: "work";
        campus: "campus";
        founder: "founder";
    }>>;
    period: z.ZodString;
    org: z.ZodString;
    title: z.ZodString;
    details: z.ZodOptional<z.ZodArray<z.ZodString>>;
    rich: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
declare const ResumeEducationSchema: z.ZodObject<{
    school: z.ZodString;
    school_en: z.ZodOptional<z.ZodString>;
    major: z.ZodOptional<z.ZodString>;
    degree: z.ZodOptional<z.ZodString>;
    period: z.ZodOptional<z.ZodString>;
    gpa: z.ZodOptional<z.ZodString>;
    courses: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
declare const ResumeProjectSchema: z.ZodObject<{
    name: z.ZodString;
    role: z.ZodOptional<z.ZodString>;
    period: z.ZodOptional<z.ZodString>;
    stack: z.ZodOptional<z.ZodArray<z.ZodString>>;
    details: z.ZodOptional<z.ZodArray<z.ZodString>>;
    links: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
declare const ResumeAchievementSchema: z.ZodObject<{
    title: z.ZodString;
    level: z.ZodOptional<z.ZodString>;
    year: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
declare const ResumeCertificateSchema: z.ZodObject<{
    name: z.ZodString;
    issuer: z.ZodOptional<z.ZodString>;
    year: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
declare const RESUME_SKILL_CATEGORIES: readonly ["programming", "ai_engineering", "ai_theory", "data", "product", "finance", "tools", "ai_tools", "languages"];
type ResumeSkillCategory = (typeof RESUME_SKILL_CATEGORIES)[number];
declare const ResumeSkillsSchema: z.ZodObject<{
    product: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    data: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    programming: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    ai_engineering: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    ai_theory: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    finance: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    tools: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    ai_tools: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    languages: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
}, z.core.$strip>;
declare const ResumePublicationSchema: z.ZodObject<{
    title: z.ZodString;
    venue: z.ZodOptional<z.ZodString>;
    year: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
declare const ResumePatentSchema: z.ZodObject<{
    title: z.ZodString;
    id: z.ZodOptional<z.ZodString>;
    year: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
declare const ResumeOpenSourceSchema: z.ZodObject<{
    repo: z.ZodString;
    stars: z.ZodOptional<z.ZodNumber>;
    role: z.ZodOptional<z.ZodString>;
    highlights: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
declare const ResumeFundingSchema: z.ZodObject<{
    round: z.ZodString;
    amount: z.ZodOptional<z.ZodString>;
    date: z.ZodOptional<z.ZodString>;
    investors: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
declare const ResumePressSchema: z.ZodObject<{
    title: z.ZodString;
    outlet: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodURL>;
    date: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
declare const ResumeVolunteeringSchema: z.ZodObject<{
    org: z.ZodString;
    role: z.ZodOptional<z.ZodString>;
    period: z.ZodOptional<z.ZodString>;
    details: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
declare const ResumeMarginsSchema: z.ZodObject<{
    top: z.ZodString;
    right: z.ZodString;
    bottom: z.ZodString;
    left: z.ZodString;
}, z.core.$strip>;
declare const DEFAULT_RESUME_MARGINS: {
    readonly top: "12mm";
    readonly right: "12mm";
    readonly bottom: "12mm";
    readonly left: "12mm";
};
declare const ResumePreferencesSchema: z.ZodObject<{
    length: z.ZodDefault<z.ZodEnum<{
        "1page": "1page";
        "2pages": "2pages";
    }>>;
    show_icons: z.ZodDefault<z.ZodBoolean>;
    show_contact_public: z.ZodDefault<z.ZodBoolean>;
    paper: z.ZodDefault<z.ZodEnum<{
        A4: "A4";
        Letter: "Letter";
    }>>;
    margins: z.ZodDefault<z.ZodObject<{
        top: z.ZodString;
        right: z.ZodString;
        bottom: z.ZodString;
        left: z.ZodString;
    }, z.core.$strip>>;
    max_bullets_per_entry: z.ZodDefault<z.ZodNumber>;
    section_order: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
declare const ResumeContentV1Schema: z.ZodObject<{
    version: z.ZodDefault<z.ZodLiteral<1>>;
    basic: z.ZodObject<{
        name: z.ZodString;
        name_en: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodEmail>;
        phone: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodString>;
        website: z.ZodOptional<z.ZodURL>;
        links: z.ZodOptional<z.ZodObject<{
            github: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            linkedin: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            twitter: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            personal: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    objective: z.ZodDefault<z.ZodObject<{
        summary: z.ZodOptional<z.ZodString>;
        advantage_tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    ventures: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        role: z.ZodOptional<z.ZodString>;
        period: z.ZodOptional<z.ZodString>;
        stage: z.ZodOptional<z.ZodEnum<{
            idea: "idea";
            building: "building";
            launched: "launched";
            scaling: "scaling";
            exited: "exited";
            closed: "closed";
        }>>;
        outcome: z.ZodOptional<z.ZodString>;
        url: z.ZodOptional<z.ZodURL>;
        details: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>>;
    experiences: z.ZodOptional<z.ZodArray<z.ZodObject<{
        kind: z.ZodDefault<z.ZodEnum<{
            work: "work";
            campus: "campus";
            founder: "founder";
        }>>;
        period: z.ZodString;
        org: z.ZodString;
        title: z.ZodString;
        details: z.ZodOptional<z.ZodArray<z.ZodString>>;
        rich: z.ZodOptional<z.ZodString>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>>;
    education: z.ZodOptional<z.ZodArray<z.ZodObject<{
        school: z.ZodString;
        school_en: z.ZodOptional<z.ZodString>;
        major: z.ZodOptional<z.ZodString>;
        degree: z.ZodOptional<z.ZodString>;
        period: z.ZodOptional<z.ZodString>;
        gpa: z.ZodOptional<z.ZodString>;
        courses: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>>;
    projects: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        role: z.ZodOptional<z.ZodString>;
        period: z.ZodOptional<z.ZodString>;
        stack: z.ZodOptional<z.ZodArray<z.ZodString>>;
        details: z.ZodOptional<z.ZodArray<z.ZodString>>;
        links: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>>;
    achievements: z.ZodOptional<z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        level: z.ZodOptional<z.ZodString>;
        year: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    certificates: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        issuer: z.ZodOptional<z.ZodString>;
        year: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    skills: z.ZodOptional<z.ZodObject<{
        product: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
        data: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
        programming: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
        ai_engineering: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
        ai_theory: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
        finance: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
        tools: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
        ai_tools: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
        languages: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    }, z.core.$strip>>;
    publications: z.ZodOptional<z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        venue: z.ZodOptional<z.ZodString>;
        year: z.ZodOptional<z.ZodString>;
        url: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    patents: z.ZodOptional<z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        id: z.ZodOptional<z.ZodString>;
        year: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    opensource: z.ZodOptional<z.ZodArray<z.ZodObject<{
        repo: z.ZodString;
        stars: z.ZodOptional<z.ZodNumber>;
        role: z.ZodOptional<z.ZodString>;
        highlights: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>>;
    funding: z.ZodOptional<z.ZodArray<z.ZodObject<{
        round: z.ZodString;
        amount: z.ZodOptional<z.ZodString>;
        date: z.ZodOptional<z.ZodString>;
        investors: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>>;
    press: z.ZodOptional<z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        outlet: z.ZodOptional<z.ZodString>;
        url: z.ZodOptional<z.ZodURL>;
        date: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    volunteering: z.ZodOptional<z.ZodArray<z.ZodObject<{
        org: z.ZodString;
        role: z.ZodOptional<z.ZodString>;
        period: z.ZodOptional<z.ZodString>;
        details: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>>;
    interests: z.ZodOptional<z.ZodArray<z.ZodString>>;
    preferences: z.ZodPrefault<z.ZodObject<{
        length: z.ZodDefault<z.ZodEnum<{
            "1page": "1page";
            "2pages": "2pages";
        }>>;
        show_icons: z.ZodDefault<z.ZodBoolean>;
        show_contact_public: z.ZodDefault<z.ZodBoolean>;
        paper: z.ZodDefault<z.ZodEnum<{
            A4: "A4";
            Letter: "Letter";
        }>>;
        margins: z.ZodDefault<z.ZodObject<{
            top: z.ZodString;
            right: z.ZodString;
            bottom: z.ZodString;
            left: z.ZodString;
        }, z.core.$strip>>;
        max_bullets_per_entry: z.ZodDefault<z.ZodNumber>;
        section_order: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
type ResumeContentV1 = z.infer<typeof ResumeContentV1Schema>;
type ResumeContentV1Input = z.input<typeof ResumeContentV1Schema>;
/** Write payload accepted by `PUT /api/resume`. */
declare const ResumeWriteSchema: z.ZodObject<{
    content: z.ZodObject<{
        version: z.ZodDefault<z.ZodLiteral<1>>;
        basic: z.ZodObject<{
            name: z.ZodString;
            name_en: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodEmail>;
            phone: z.ZodOptional<z.ZodString>;
            location: z.ZodOptional<z.ZodString>;
            website: z.ZodOptional<z.ZodURL>;
            links: z.ZodOptional<z.ZodObject<{
                github: z.ZodOptional<z.ZodOptional<z.ZodString>>;
                linkedin: z.ZodOptional<z.ZodOptional<z.ZodString>>;
                twitter: z.ZodOptional<z.ZodOptional<z.ZodString>>;
                personal: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        objective: z.ZodDefault<z.ZodObject<{
            summary: z.ZodOptional<z.ZodString>;
            advantage_tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>;
        ventures: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            role: z.ZodOptional<z.ZodString>;
            period: z.ZodOptional<z.ZodString>;
            stage: z.ZodOptional<z.ZodEnum<{
                idea: "idea";
                building: "building";
                launched: "launched";
                scaling: "scaling";
                exited: "exited";
                closed: "closed";
            }>>;
            outcome: z.ZodOptional<z.ZodString>;
            url: z.ZodOptional<z.ZodURL>;
            details: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>>;
        experiences: z.ZodOptional<z.ZodArray<z.ZodObject<{
            kind: z.ZodDefault<z.ZodEnum<{
                work: "work";
                campus: "campus";
                founder: "founder";
            }>>;
            period: z.ZodString;
            org: z.ZodString;
            title: z.ZodString;
            details: z.ZodOptional<z.ZodArray<z.ZodString>>;
            rich: z.ZodOptional<z.ZodString>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>>;
        education: z.ZodOptional<z.ZodArray<z.ZodObject<{
            school: z.ZodString;
            school_en: z.ZodOptional<z.ZodString>;
            major: z.ZodOptional<z.ZodString>;
            degree: z.ZodOptional<z.ZodString>;
            period: z.ZodOptional<z.ZodString>;
            gpa: z.ZodOptional<z.ZodString>;
            courses: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>>;
        projects: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            role: z.ZodOptional<z.ZodString>;
            period: z.ZodOptional<z.ZodString>;
            stack: z.ZodOptional<z.ZodArray<z.ZodString>>;
            details: z.ZodOptional<z.ZodArray<z.ZodString>>;
            links: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>>;
        achievements: z.ZodOptional<z.ZodArray<z.ZodObject<{
            title: z.ZodString;
            level: z.ZodOptional<z.ZodString>;
            year: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
        certificates: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            issuer: z.ZodOptional<z.ZodString>;
            year: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
        skills: z.ZodOptional<z.ZodObject<{
            product: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
            data: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
            programming: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
            ai_engineering: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
            ai_theory: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
            finance: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
            tools: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
            ai_tools: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
            languages: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
        }, z.core.$strip>>;
        publications: z.ZodOptional<z.ZodArray<z.ZodObject<{
            title: z.ZodString;
            venue: z.ZodOptional<z.ZodString>;
            year: z.ZodOptional<z.ZodString>;
            url: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
        patents: z.ZodOptional<z.ZodArray<z.ZodObject<{
            title: z.ZodString;
            id: z.ZodOptional<z.ZodString>;
            year: z.ZodOptional<z.ZodString>;
            status: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
        opensource: z.ZodOptional<z.ZodArray<z.ZodObject<{
            repo: z.ZodString;
            stars: z.ZodOptional<z.ZodNumber>;
            role: z.ZodOptional<z.ZodString>;
            highlights: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>>;
        funding: z.ZodOptional<z.ZodArray<z.ZodObject<{
            round: z.ZodString;
            amount: z.ZodOptional<z.ZodString>;
            date: z.ZodOptional<z.ZodString>;
            investors: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>>;
        press: z.ZodOptional<z.ZodArray<z.ZodObject<{
            title: z.ZodString;
            outlet: z.ZodOptional<z.ZodString>;
            url: z.ZodOptional<z.ZodURL>;
            date: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
        volunteering: z.ZodOptional<z.ZodArray<z.ZodObject<{
            org: z.ZodString;
            role: z.ZodOptional<z.ZodString>;
            period: z.ZodOptional<z.ZodString>;
            details: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>>;
        interests: z.ZodOptional<z.ZodArray<z.ZodString>>;
        preferences: z.ZodPrefault<z.ZodObject<{
            length: z.ZodDefault<z.ZodEnum<{
                "1page": "1page";
                "2pages": "2pages";
            }>>;
            show_icons: z.ZodDefault<z.ZodBoolean>;
            show_contact_public: z.ZodDefault<z.ZodBoolean>;
            paper: z.ZodDefault<z.ZodEnum<{
                A4: "A4";
                Letter: "Letter";
            }>>;
            margins: z.ZodDefault<z.ZodObject<{
                top: z.ZodString;
                right: z.ZodString;
                bottom: z.ZodString;
                left: z.ZodString;
            }, z.core.$strip>>;
            max_bullets_per_entry: z.ZodDefault<z.ZodNumber>;
            section_order: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    is_public: z.ZodOptional<z.ZodBoolean>;
    language: z.ZodOptional<z.ZodEnum<{
        ZH: "ZH";
        EN: "EN";
        MIX: "MIX";
    }>>;
}, z.core.$strip>;
type ResumeWrite = z.infer<typeof ResumeWriteSchema>;
/** Columns derived from `content` on every save; see apps/sleptons/src/lib/resume/derive.ts. */
declare const ResumeDerivedSchema: z.ZodObject<{
    headline: z.ZodNullable<z.ZodString>;
    skills_flat: z.ZodArray<z.ZodString>;
    highlights: z.ZodArray<z.ZodString>;
    years_active: z.ZodNullable<z.ZodNumber>;
    completeness: z.ZodNumber;
}, z.core.$strip>;
type ResumeDerived = z.infer<typeof ResumeDerivedSchema>;

export { DEFAULT_RESUME_MARGINS, type ExperienceKind, ExperienceKindSchema, RESUME_CONTENT_VERSION, RESUME_SKILL_CATEGORIES, ResumeAchievementSchema, ResumeBasicSchema, ResumeCertificateSchema, type ResumeContentV1, type ResumeContentV1Input, ResumeContentV1Schema, type ResumeDerived, ResumeDerivedSchema, ResumeEducationSchema, ResumeExperienceSchema, ResumeFundingSchema, type ResumeLang, ResumeLangSchema, ResumeLinksSchema, ResumeMarginsSchema, ResumeObjectiveSchema, ResumeOpenSourceSchema, ResumePatentSchema, ResumePeriodSchema, ResumePreferencesSchema, ResumePressSchema, ResumeProjectSchema, ResumePublicationSchema, type ResumeSkillCategory, ResumeSkillsSchema, ResumeVentureSchema, ResumeVolunteeringSchema, type ResumeWrite, ResumeWriteSchema, type VentureStage, VentureStageSchema };
