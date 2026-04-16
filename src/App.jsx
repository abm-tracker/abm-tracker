import { useState, useMemo, useEffect } from "react";
import { X, Check, ChevronDown, ChevronUp, Filter, Users, Clock, Pin, Plus, BarChart3, MessageSquare, Building2, Settings, Home, Flag, CheckSquare, Menu } from "lucide-react";

const LOGINS = {
  Dustin:     { password: "Turtles2323!", isAdmin: true },
  Jessica:    { password: "Pizza4Life!", isAdmin: false },
  Ty:         { password: "ShellYeah23!", isAdmin: false },
  Charlotte:  { password: "NinjaPower!", isAdmin: false },
  Sydni:      { password: "Booyakasha1!", isAdmin: false },
  Marco:      { password: "RadicalDude!", isAdmin: false },
  TherapyOps: { password: "Rx#9mPqL$2vNkT@w", isAdmin: false, isTherapy: true },
};
const TEAM_MEMBERS = ["Jessica","Ty","Charlotte","Sydni","Marco"];

const departments = [
  { name: "Clinic Operations", color: "#3b82f6", divisions: [
    { name: "Front Office", drivers: ["Copay Collection","Insurance Verification","Daily review and reconciliation of completed and no-show appointments","Form Completion","Provider Support"] },
    { name: "PVP", drivers: ["Insurance Confirmation and Copay Determination for New Patients","Virtual Copays","Balance Collection","MEDUSA Worksheet","Front Desk Support"] }
  ]},
  { name: "Shared Services", color: "#10b981", divisions: [
    { name: "Intake", drivers: ["Prioritizing identification and scheduling of open new patient appointments within 72 hours","Appropriate Scheduling per Triage Rules","92.5% Answer Percentage","Working New Patient Wait List","Patient Customer Service"] },
    { name: "PC", drivers: ["Reducing no-show rates by proactively offering virtual appointments or later-day rescheduling","92.5% Answer Percentage","Provider Schedule Change Requests","Patient Customer Service","Outreach to patients without a scheduled follow-up appointment"] },
    { name: "Referrals", drivers: ["Referrals contacted within 24 Hours","Referral Conversion Percentage","Appropriate Scheduling per Triage Rules","90% Answer Percentage","Strategic Referral Relationship Management"] },
    { name: "Therapy Scheduling", drivers: ["Prioritizing identification and scheduling of open new patient appointments within 72 hours","Priority List Conversion Percentage","Appropriate Scheduling per Triage Rules","90% Answer Percentage","Coordinating with Front Office to fill in-person openings within 24 hours"] },
    { name: "HIM", drivers: ["Uploading Referrals","Identifying and escalating subpoenas cases","Stat Referrals","Referral Partner Updates","Ensuring case closure within 21 days"] }
  ]}
];

const DIVISION_METRICS = {
  "Front Office": [
    { key: "copayCollection", label: "Copay Collection %", target: 92.5, unit: "%", higherIsBetter: true },
    { key: "notCheckedOut", label: "Appts Not Checked Out", target: 0, unit: "", higherIsBetter: false },
    { key: "inactiveInsurance", label: "Inactive Insurance Follow-ups", target: 0, unit: "", higherIsBetter: false },
  ],
  "PVP": [
    { key: "virtualCopay", label: "Virtual Copay Collection %", target: 82.5, unit: "%", higherIsBetter: true },
    { key: "smallBalances", label: "Small Balances from Last Week", target: 0, unit: "", higherIsBetter: false },
  ],
  "PC":                 [{ key: "phoneAnswer",        label: "Phone Answer %",             target: 92.5, unit: "%", higherIsBetter: true }],
  "Intake":             [{ key: "phoneAnswer",        label: "Phone Answer %",             target: 92.5, unit: "%", higherIsBetter: true }],
  "Referrals":          [{ key: "referralConversion", label: "Referral Conversion %",      target: 75,   unit: "%", higherIsBetter: true }],
  "Therapy Scheduling": [{ key: "priorityConversion", label: "Priority List Conversion %", target: 75,   unit: "%", higherIsBetter: true }],
  "HIM":                [{ key: "casesOver21",        label: "Cases Over 21 Days",         target: 0,    unit: "%", higherIsBetter: false }],
};

const FTE_STRUCTURE = {
  "Shared Services": ["Intake","Patient Concierge","Therapy Scheduling","Referrals","HIM"],
  "Operations":      ["Front Desk","PVP"],
};
const DEFAULT_FTE = () => {
  const init = {};
  Object.entries(FTE_STRUCTURE).forEach(([div, depts]) => {
    init[div] = {};
    depts.forEach(dept => { init[div][dept] = { fte: 0, requisitions: [] }; });
  });
  return init;
};

// ── Provider Data ─────────────────────────────────────────────────────────────
const DEPT_COLORS = {
  Greenville:"#5DCAA5","Independent Contract":"#EF9F27","Winston-Salem":"#AFA9EC",
  Greensboro:"#ED93B1",Hickory:"#5DCAA5","Mt. Airy":"#EF9F27",Asheville:"#85B7EB",
  Charlotte:"#F09595",Raleigh:"#9FE1CB",Durham:"#AFA9EC",Other:"#888780",All:"#888780"
};
const PROVIDER_DEPTS = ["All","Greenville","Independent Contract","Winston-Salem","Greensboro","Hickory","Mt. Airy","Asheville","Charlotte","Raleigh","Durham","Other"];
const STD = ["Aetna","Alliance Health Medicaid","Ambetter","Amerihealth Next","BCBS","Cigna","DirectNET","Gateway","HealthTeam","Humana","Medcost","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct (12/1/25)","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military","Wellcare (Medicare)"];
const GBO_C = ["ADHD","Anger Management","Anxiety","Bipolar","Depression","Dissociative Disorder","DMDD","Grief","ODD/Mild Conduct","Mild OCD","LGBTQ+ Affirmative Therapy","Personality Disorders","Postpartum Depression","PTSD/Trauma","Relationships","Schizophrenia","Substance Use","Stress Management","Secondary Mild IDD"];
const GBO_C2 = ["ADHD","Anger Management","Anxiety","Bipolar","Depression","DMDD","Grief","ODD/Conduct Disorder","Mild OCD","Personality Disorders","Postpartum Depression","PTSD/Trauma","Relationships","Schizophrenia","LGBTQ+","Secondary Substance Use","Stress Management","Secondary Mild IDD"];
const PED_C = ["ADHD","Anger Management","Anxiety","Mild Autism","Bipolar Disorder","Depression","DMDD","Grief","ODD/Mild Conduct Disorder","Mild OCD","PTSD/Trauma","Postpartum Depression","Schizophrenia","LGBTQ+","Personality Disorders","Play Therapy","Secondary Substance Use","Stress Management","Secondary Mild IDD"];
const HKY_C2 = ["ADHD","Anger Management","Anxiety","Bipolar","Depression","DMDD","Grief","ODD/Conduct Disorder","Mild OCD","Personality Disorders","Postpartum Depression","PTSD/Trauma","Relationships","Schizophrenia","LGBTQ+","Secondary Substance Use","Stress Management","Secondary Mild IDD"];
const CLT_C = ["ADHD","Anger Management","Anxiety","Bipolar","Depression","Dissociative Disorder","DMDD","Grief","ODD/Mild Conduct","Mild OCD","LGBTQ+ Affirmative Therapy","Personality Disorders","Postpartum Depression","PTSD/Trauma","Relationships","Schizophrenia","Substance Use","Stress Management","Secondary Mild IDD"];
const CLT_C2 = ["ADHD","Anger Management","Anxiety","Bipolar","Depression","DMDD","Grief","ODD/Conduct Disorder","Mild OCD","Personality Disorders","Postpartum Depression","PTSD/Trauma","Relationships","Schizophrenia","LGBTQ+","Secondary Substance Use","Stress Management","Secondary Mild IDD","Secondary ODD/Conduct"];

const normalize = (list) => [...new Set(list.map(i => {
  if (i === "Partners" || i === "Partners Medicaid") return "Partners Medicaid";
  if (i === "Wellcare (Medicaid)") return "Carolina Complete Medicaid";
  return i;
}))];

const RAW_PROVIDERS = [
  {id:54,name:"Catherine Francis",credentials:"LCSWA",role:"Pediatric Associate Therapist",department:"Greenville",ages:"6–30",location:["Greenville","Virtual"],expertise:["ADHD","Anxiety Disorders","Autism","Childhood Behavioral Disorders","Grief"],conditions:PED_C,insurance_active:["Aetna","Alliance Health Medicaid","BCBS","DirectNET","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)"],insurance_inactive:["Ambetter","Amerihealth Next","Cigna","Humana","Medcost","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military","Wellcare (Medicare)"]},
  {id:1,name:"Carly Fields",credentials:"LCMHCA",role:"Pediatric Associate Therapist",department:"Greenville",ages:"6–26",location:["Greenville","Virtual"],expertise:["ADHD","Anxiety Disorders","Autism","Mood Disorders","Sexual Health","Substance Use Conditions"],conditions:PED_C,insurance_active:["Alliance Health Medicaid","Ambetter","BCBS","DirectNET","HealthTeam","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)"],insurance_inactive:["Aetna","Amerihealth Next","Cigna","Gateway","Humana","Medcost","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military","Wellcare (Medicare)"]},
  {id:55,name:"Chelsea McGhee",credentials:"LCSWA",role:"Associate General Therapist",department:"Greenville",ages:"10+",location:["Greenville","Virtual"],expertise:["ADHD","Anxiety Disorders","Autism","Childhood Behavioral Disorders","Eating Disorders","Family and Couples","Grief","LGBTQ+","Men's Mental Health","Mood Disorders","Play Therapy","PTSD/Trauma","Self-Harm & Suicidality","Sexual Health","Substance Use Conditions","Women's Mental Health"],conditions:GBO_C,insurance_active:["Aetna","Alliance Health Medicaid","Ambetter","BCBS","Cigna","DirectNET","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct (12/1/25)"],insurance_inactive:["Amerihealth Next","Humana","Medcost","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military","Wellcare (Medicare)"]},
  {id:2,name:"Lauren Adams",credentials:"LCSW",role:"General Independent Contract Therapist",department:"Independent Contract",ages:"10+",location:["Virtual"],expertise:["EMDR","ADHD","Anxiety Disorders","Chronic Pain","Grief","LGBTQ+","Mood Disorders","PTSD/Trauma","Self-Harm & Suicidality","Women's Mental Health"],conditions:GBO_C,insurance_active:STD,insurance_inactive:[]},
  {id:3,name:"Sirrell James",credentials:"LCSW",role:"Adult Independent Contract Therapist",department:"Independent Contract",ages:"16+",location:["Virtual"],expertise:["Anxiety Disorders","Chronic Pain","Grief","Men's Mental Health","Mood Disorders","PTSD/Trauma","Self-Harm & Suicidality","Women's Mental Health"],conditions:GBO_C,insurance_active:["Aetna","Alliance Health Medicaid","Ambetter","BCBS","DirectNET","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)","Medicare","UBH/UHC/Optum","TriCare/Humana Military"],insurance_inactive:["Amerihealth Next","Cigna","Humana","Medcost","Blue Medicare","Wellcare (Medicare)"]},
  {id:4,name:"Kristy Wood",credentials:"LCMHC",role:"Adult General Therapist (IC)",department:"Independent Contract",ages:"10+",location:["Virtual"],expertise:["Grief","LGBTQ+","PTSD/Trauma"],conditions:GBO_C,insurance_active:["Aetna","Alliance Health Medicaid","Ambetter","Amerihealth Next","BCBS","DirectNET","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)","Medicare","Blue Medicare","UBH/UHC/Optum"],insurance_inactive:["Cigna","Medcost","TriCare/Humana Military","Wellcare (Medicare)"]},
  {id:7,name:"Cindy Arrington",credentials:"CRC, LCMHC, LCAS-A",role:"Adult Addictions Therapist (IC)",department:"Winston-Salem",ages:"16+",location:["Virtual"],expertise:["ADHD","Anxiety Disorders","Autism","Grief","Mood Disorders","PTSD/Trauma","Substance Use Conditions"],conditions:GBO_C,insurance_active:STD,insurance_inactive:[]},
  {id:8,name:"Alena Blue",credentials:"LCMHCA",role:"General Associate Therapist",department:"Winston-Salem",ages:"10+",location:["Winston-Salem","Virtual"],expertise:["ADHD","Anxiety Disorders","Childhood Behavioral Disorders","Eating Disorders","Family and Couples","LGBTQ+","Mood Disorders","PTSD/Trauma","Self-Harm & Suicidality","Substance Use Conditions","Women's Mental Health"],conditions:GBO_C,insurance_active:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medcost","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)"],insurance_inactive:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military","Wellcare (Medicare)"]},
  {id:9,name:"Kenzie Cameron",credentials:"LCSW",role:"Pediatric Therapist",department:"Winston-Salem",ages:"6+",location:["Winston-Salem","Virtual"],expertise:["EMDR","ADHD","Anxiety Disorders","Childhood Behavioral Disorders","Chronic Pain","Grief","LGBTQ+","Mood Disorders","Play Therapy","PTSD/Trauma","Women's Mental Health"],conditions:PED_C,insurance_active:["Aetna","Alliance Health Medicaid","Ambetter","BCBS","DirectNET","Gateway","HealthTeam","Medcost","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military"],insurance_inactive:["Amerihealth Next","Cigna","Humana","Medicare","Wellcare (Medicare)"]},
  {id:10,name:"Kimberly Colon",credentials:"LCMHC",role:"General Therapist (Spanish-speaking)",department:"Winston-Salem",ages:"10+",location:["Winston-Salem","Virtual"],expertise:["EMDR","ADHD","Anxiety Disorders","Autism","Childhood Behavioral Disorders","Grief","LGBTQ+","Men's Mental Health","PTSD/Trauma","Self-Harm & Suicidality","Sexual Health","Women's Mental Health"],conditions:GBO_C,insurance_active:STD,insurance_inactive:[]},
  {id:11,name:"Renee Heagney",credentials:"LMCHC, NCC, BC-DMT",role:"Adult Therapist",department:"Winston-Salem",ages:"16+",location:["Greensboro","Virtual"],expertise:["EMDR","PTSD/Trauma","Movement Therapy"],conditions:GBO_C,insurance_active:STD,insurance_inactive:[]},
  {id:12,name:"Emily Kirker",credentials:"LCSWA",role:"Adult Associate Therapist",department:"Winston-Salem",ages:"18+",location:["Winston-Salem","Virtual"],expertise:["ADHD","Anxiety Disorders","Autism","Grief","LGBTQ+","Mood Disorders","Self-Harm & Suicidality","Sexual Health","Women's Mental Health","Somatic Techniques"],conditions:GBO_C2,insurance_active:["Aetna","Alliance Health Medicaid","Ambetter","Amerihealth Next","BCBS","Cigna","DirectNET","HealthTeam","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military","Wellcare (Medicare)"],insurance_inactive:["Humana","Medcost","Gateway"]},
  {id:13,name:"Bria Roddy",credentials:"LCMHCA",role:"Associate Pediatric Therapist",department:"Winston-Salem",ages:"6–40",location:["Winston-Salem","Virtual"],expertise:["ADHD","Anxiety Disorders","Autism","Childhood Behavioral Disorders","Family and Couples","LGBTQ+","Men's Mental Health","Mood Disorders","Play Therapy","Self-Harm & Suicidality","Women's Mental Health"],conditions:GBO_C,insurance_active:["Aetna","Alliance Health Medicaid","Ambetter","BCBS","DirectNET","Gateway","HealthTeam","Medcost","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)"],insurance_inactive:["Amerihealth Next","Cigna","Humana","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military","Wellcare (Medicare)"]},
  {id:14,name:"Kioka Brown",credentials:"LCMHCA",role:"General Associate Therapist",department:"Greensboro",ages:"10+",location:["Greensboro","Virtual"],expertise:["ADHD","Anxiety Disorders","Autism","Childhood Behavioral Disorders","Chronic Pain","Family and Couples","Grief","LGBTQ+","Mood Disorders","Play Therapy","PTSD/Trauma","Self-Harm & Suicidality","Women's Mental Health"],conditions:GBO_C,insurance_active:["Alliance Health Medicaid","Ambetter","BCBS","DirectNET","Gateway","HealthTeam","Medcost","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)"],insurance_inactive:["Aetna","Amerihealth Next","Cigna","Humana","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military"]},
  {id:16,name:"Elise Coffman",credentials:"LCMHCA",role:"General Associate Therapist",department:"Greensboro",ages:"13+",location:["Greensboro","Virtual"],expertise:["ADHD","Anxiety Disorders","Autism","Chronic Pain","Eating Disorders","Grief","LGBTQ+","Men's Mental Health","Mood Disorders","PTSD/Trauma","Self-Harm & Suicidality","Women's Mental Health"],conditions:GBO_C,insurance_active:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medcost","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)"],insurance_inactive:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military"]},
  {id:17,name:"D'Nasia Council",credentials:"LCMHCA",role:"General Associate Therapist",department:"Greensboro",ages:"10+",location:["Greensboro","Virtual"],expertise:["ADHD","Anxiety Disorders","Autism","Childhood Behavioral Disorders","Grief","LGBTQ+","Mood Disorders","Play Therapy","PTSD/Trauma","Self-Harm & Suicidality","Women's Mental Health"],conditions:GBO_C,insurance_active:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)"],insurance_inactive:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military"]},
  {id:18,name:"Ashton Gilbert",credentials:"LCSWA",role:"General Associate Therapist",department:"Greensboro",ages:"10+",location:["Greensboro","Virtual"],expertise:["ADHD","Anxiety Disorders","Childhood Behavioral Disorders","Grief","Mood Disorders","Play Therapy","PTSD/Trauma","Self-Harm & Suicidality","Women's Mental Health"],conditions:GBO_C,insurance_active:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)"],insurance_inactive:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military"]},
  {id:19,name:"Sander Scott",credentials:"LCSW, LCAS",role:"Addiction Therapist",department:"Greensboro",ages:"14+",location:["Greensboro","Virtual"],expertise:["ADHD","Anxiety Disorders","Grief","LGBTQ+","Men's Mental Health","Mood Disorders","PTSD/Trauma","Self-Harm & Suicidality","Substance Use Conditions","Women's Mental Health"],conditions:GBO_C,insurance_active:["Alliance Health Medicaid","Ambetter","Amerihealth Next","BCBS","Gateway","HealthTeam","Humana","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military"],insurance_inactive:["Aetna","Cigna","DirectNET","Medcost"]},
  {id:20,name:"Sarah Shine",credentials:"LCSWA",role:"Associate Adult Therapist",department:"Greensboro",ages:"16+",location:["Greensboro","Virtual"],expertise:["ADHD","Anxiety Disorders","Chronic Pain","Grief","LGBTQ+","Men's Mental Health","Mood Disorders","PTSD/Trauma","Self-Harm & Suicidality","Women's Mental Health"],conditions:GBO_C2,insurance_active:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)"],insurance_inactive:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military"]},
  {id:21,name:"Sarah Smith",credentials:"LCSWA",role:"General Associate Therapist",department:"Greensboro",ages:"6–40",location:["Greensboro","Virtual"],expertise:["ADHD","Anxiety Disorders","Eating Disorders","Grief","LGBTQ+","Mood Disorders","PTSD/Trauma","Women's Mental Health"],conditions:GBO_C2,insurance_active:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)"],insurance_inactive:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military"]},
  {id:22,name:"Janae Stitt",credentials:"LCMHCA",role:"Adult Associate Therapist",department:"Greensboro",ages:"16+",location:["Greensboro","Virtual"],expertise:["ADHD","Anxiety Disorders","Grief","LGBTQ+","Men's Mental Health","Self-Harm & Suicidality","Substance Use Conditions","Women's Mental Health"],conditions:GBO_C2,insurance_active:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)"],insurance_inactive:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military"]},
  {id:23,name:"Rayana Swanson",credentials:"LCMHCA",role:"Pediatric Associate Therapist",department:"Greensboro",ages:"6–26",location:["Greensboro","Virtual"],expertise:["ADHD","Anxiety Disorders","Autism","Childhood Behavioral Disorders","Family and Couples","Grief","Mood Disorders","Play Therapy","PTSD/Trauma","Self-Harm & Suicidality"],conditions:PED_C,insurance_active:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)"],insurance_inactive:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military"]},
  {id:24,name:"Brianna Williams",credentials:"LCMHCA",role:"Adult Associate Therapist",department:"Greensboro",ages:"16+",location:["Greensboro","Virtual"],expertise:["Anxiety Disorders","Grief","LGBTQ+","PTSD/Trauma","Women's Mental Health"],conditions:GBO_C2,insurance_active:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)"],insurance_inactive:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Medicare","Blue Medicare","UBH/UHC/Optum"]},
  {id:25,name:"Jada Williams",credentials:"LCMHC",role:"Pediatric Therapist",department:"Greensboro",ages:"18–40",location:["Greensboro","Virtual"],expertise:["ADHD","Anxiety Disorders","Childhood Behavioral Disorders","Family and Couples","Grief","LGBTQ+","Mood Disorders","Play Therapy","PTSD/Trauma","Women's Mental Health"],conditions:PED_C,insurance_active:["Alliance Health Medicaid","Ambetter","Amerihealth Next","BCBS","Gateway","HealthTeam","Humana","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)","Medicare","Blue Medicare"],insurance_inactive:["Aetna","Cigna","DirectNET","Medcost","UBH/UHC/Optum","TriCare/Humana Military"]},
  {id:26,name:"TyZhane Young",credentials:"LCSWA",role:"Pediatric Associate Therapist",department:"Greensboro",ages:"6–26",location:["Greensboro","Virtual"],expertise:["ADHD","Anxiety Disorders","Autism","Childhood Behavioral Disorders","Family and Couples","Grief","LGBTQ+","Mood Disorders","Play Therapy","PTSD/Trauma","Self-Harm & Suicidality","Women's Mental Health"],conditions:PED_C,insurance_active:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)"],insurance_inactive:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military"]},
  {id:27,name:"Sarah Clay",credentials:"LCSWA",role:"General Associate Therapist",department:"Hickory",ages:"10+",location:["Hickory","Virtual"],expertise:["ADHD","Anxiety Disorders","Autism","Childhood Behavioral Disorders","Family and Couples","LGBTQ+","Mood Disorders","Movement Therapy","Play Therapy","PTSD/Trauma","Self-Harm & Suicidality","Women's Mental Health"],conditions:GBO_C,insurance_active:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)"],insurance_inactive:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military"]},
  {id:28,name:"Melissa Kerekes",credentials:"LCSW",role:"Pediatric Therapist",department:"Hickory",ages:"6–40",location:["Hickory","Virtual"],expertise:["Family and Couples","ADHD","Anxiety Disorders","Autism","Childhood Behavioral Disorders","LGBTQ+","Mood Disorders","Movement Therapy","PTSD/Trauma","Self-Harm and Suicidality","Sexual Health","Substance Use Conditions","Women's Mental Health"],conditions:PED_C,insurance_active:STD,insurance_inactive:[]},
  {id:29,name:"Ruby Osorio",credentials:"LCMHCA",role:"General Associate Therapist",department:"Hickory",ages:"10+",location:["Hickory","Virtual"],expertise:["ADHD","Anxiety Disorders","Autism","Childhood Behavioral Disorders","Chronic Pain","Eating Disorders","Family and Couples","Grief","LGBTQ+","Men's Mental Health","Mood Disorders","Movement Therapy","Play Therapy","PTSD/Trauma","Self-Harm & Suicidality","Women's Mental Health"],conditions:GBO_C,insurance_active:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)"],insurance_inactive:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military"]},
  {id:30,name:"Julia Oesterle",credentials:"LCSW",role:"Adult Therapist",department:"Hickory",ages:"16+",location:["Virtual"],expertise:["ADHD","Anxiety Disorders","Autism","Grief","Mood Disorders","Women's Mental Health"],conditions:HKY_C2,insurance_active:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)"],insurance_inactive:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military"]},
  {id:31,name:"Ami Silva",credentials:"LCMHC",role:"General Therapist",department:"Hickory",ages:"10+",location:["Hickory","Virtual"],expertise:["ADHD","Anxiety Disorders","Autism","Childhood Behavioral Disorders","EMDR","Grief","Men's Mental Health","Mood Disorders","PTSD/Trauma","Self-Harm & Suicidality","Women's Mental Health"],conditions:GBO_C,insurance_active:STD,insurance_inactive:[]},
  {id:32,name:"Yer Vang",credentials:"LCMHCA",role:"Adult Associate Therapist",department:"Hickory",ages:"16+",location:["Hickory","Virtual"],expertise:["ADHD","Anxiety Disorders","Grief","PTSD/Trauma","Self-Harm & Suicidality"],conditions:GBO_C,insurance_active:["Alliance Health Medicaid","Ambetter","BCBS","DirectNET","HealthTeam","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)"],insurance_inactive:["Aetna","Amerihealth Next","Cigna","Gateway","Humana","Medcost","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military"]},
  {id:33,name:"Haley Yost",credentials:"LCMHCA",role:"Adult Associate Therapist",department:"Hickory",ages:"16+",location:["Hickory","Virtual"],expertise:["ADHD","Anxiety Disorders","LGBTQ+","Men's Mental Health","Mood Disorders","PTSD/Trauma","Self-Harm & Suicidality","Substance Use Conditions","Women's Mental Health"],conditions:HKY_C2,insurance_active:["Alliance Health Medicaid","Ambetter","BCBS","HealthTeam","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)"],insurance_inactive:["Aetna","Amerihealth Next","Cigna","DirectNET","Gateway","Humana","Medcost","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military"]},
  {id:34,name:"Caitlin Murphy",credentials:"LCMHCA",role:"Adult Associate Therapist",department:"Mt. Airy",ages:"16+",location:["Mount Airy","Virtual"],expertise:["ADHD","Anxiety Disorders","Autism","LGBTQ+","Mood Disorders","PTSD/Trauma","Women's Mental Health"],conditions:GBO_C2,insurance_active:["Aetna","Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medcost","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)"],insurance_inactive:["Amerihealth Next","Cigna","DirectNET","Humana","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military","Wellcare (Medicare)"]},
  {id:35,name:"Ashlyn Nelson",credentials:"LCSWA",role:"Adult Associate Therapist",department:"Mt. Airy",ages:"16+",location:["Mount Airy","Virtual"],expertise:["Anxiety Disorders","Family and Couples","Grief","Mood Disorders","PTSD/Trauma","Substance Use Conditions","Women's Mental Health"],conditions:GBO_C2,insurance_active:["Aetna","Alliance Health Medicaid","Ambetter","BCBS","DirectNET","Gateway","HealthTeam","Medcost","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)"],insurance_inactive:["Amerihealth Next","Cigna","Humana","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military","Wellcare (Medicare)"]},
  {id:36,name:"Daniel Walker",credentials:"LCMHC, LCAS",role:"Adult Addictions Therapist",department:"Asheville",ages:"16+",location:["Virtual"],expertise:["ADHD","Anxiety Disorders","Autism","Grief","LGBTQ+","Men's Mental Health","Mood Disorders","PTSD/Trauma","Sleep Disorders","Substance Use Conditions"],conditions:GBO_C,insurance_active:["Aetna","Alliance Health Medicaid","Ambetter","Amerihealth Next","BCBS","Gateway","Humana","Medcost","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military","Wellcare (Medicare)"],insurance_inactive:["Cigna","DirectNET","HealthTeam"]},
  {id:37,name:"Rayanna Abdelaziz",credentials:"LCMHCA",role:"General Associate Therapist",department:"Charlotte",ages:"10–40",location:["Charlotte","Virtual"],expertise:["Family and Couples","Anxiety Disorders","Autism","Childhood Behavioral Disorders","LGBTQ+","Men's Mental Health","Mood Disorders","PTSD/Trauma","Self-Harm & Suicidality","Sexual Health","Women's Mental Health"],conditions:CLT_C,insurance_active:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medcost","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct (12/1/25)"],insurance_inactive:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military"]},
  {id:38,name:"Julee Mae Anderson",credentials:"LCMHCA",role:"Pediatric Associate Therapist",department:"Charlotte",ages:"6–26",location:["Charlotte","Virtual"],expertise:["Anxiety Disorders","Autism","Childhood Behavioral Disorders","Family and Couples","Play Therapy","Women's Mental Health"],conditions:PED_C,insurance_active:["Alliance Health Medicaid","Ambetter","BCBS","DirectNET","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct (12/1/25)"],insurance_inactive:["Aetna","Amerihealth Next","Cigna","Humana","Medcost","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military"]},
  {id:39,name:"Christian Armour",credentials:"LCMHC, LCASA",role:"Adult Addiction Therapist",department:"Charlotte",ages:"16+",location:["Charlotte","Virtual"],expertise:["ADHD","Anxiety Disorders","Mood Disorders","Substance Use Conditions","Women's Mental Health"],conditions:CLT_C,insurance_active:["Alliance Health Medicaid","Ambetter","BCBS","DirectNET","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)","Medicare","TriCare/Humana Military"],insurance_inactive:["Aetna","Amerihealth Next","Cigna","Humana","Medcost","Blue Medicare","UBH/UHC/Optum"]},
  {id:40,name:"Christi Brannen",credentials:"LCMHC",role:"General Therapist",department:"Charlotte",ages:"10+",location:["Charlotte","Virtual"],expertise:["Anxiety Disorders","Chronic Pain","Grief","LGBTQ+","Mood Disorders","PTSD/Trauma","Sleep Disorders","Women's Mental Health"],conditions:CLT_C,insurance_active:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Humana","Medcost","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct (12/1/25)"],insurance_inactive:["Aetna","Amerihealth Next","Cigna","DirectNET","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military"]},
  {id:41,name:"Austin Kovach",credentials:"LCSWA",role:"Associate Adult Therapist",department:"Charlotte",ages:"16+",location:["Charlotte","Virtual"],expertise:["ADHD","Anxiety Disorders","LGBTQ+","Men's Mental Health","Mood Disorders","PTSD/Trauma","Self-Harm & Suicidality","Substance Use Conditions"],conditions:CLT_C2,insurance_active:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)"],insurance_inactive:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military"]},
  {id:42,name:"Jeanevra McMillan",credentials:"LMFT",role:"Adult Therapist",department:"Charlotte",ages:"16+",location:["Charlotte","Virtual"],expertise:["Couples and Family","Anxiety Disorders","Grief","Men's Mental Health","Mood Disorders","Women's Mental Health"],conditions:CLT_C2,insurance_active:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Humana","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)","Medicare","Blue Medicare"],insurance_inactive:["Aetna","Amerihealth Next","Cigna","Medcost","UBH/UHC/Optum","TriCare/Humana Military"]},
  {id:43,name:"Samira Shahedah",credentials:"LCSWA",role:"Associate Adult Therapist",department:"Charlotte",ages:"16+",location:["Charlotte","Virtual"],expertise:["ADHD","Anxiety Disorders","Chronic Pain","Grief","LGBTQ+","Men's Mental Health","Mood Disorders","PTSD/Trauma","Self-Harm & Suicidality","Women's Mental Health"],conditions:CLT_C2,insurance_active:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)"],insurance_inactive:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military"]},
  {id:44,name:"Kiana Terry",credentials:"LCSWA",role:"General Associate Therapist",department:"Charlotte",ages:"10+",location:["Charlotte","Virtual"],expertise:["Somatic Techniques","ERP for OCD","ADHD","Childhood Behavioral Disorders","Family and Couples","LGBTQ+","Men's Mental Health","Mood Disorders","PTSD/Trauma","Self-Harm & Suicidality","Women's Mental Health"],conditions:CLT_C,insurance_active:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)"],insurance_inactive:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military"]},
  {id:45,name:"Jasmine Peyton",credentials:"LCSWA",role:"General Associate Therapist",department:"Raleigh",ages:"10+",location:["Raleigh","Virtual"],expertise:["Anxiety Disorders","Childhood Behavioral Disorders","LGBTQ+","Play Therapy","Sleep Disorders","Women's Mental Health"],conditions:GBO_C,insurance_active:["Aetna","Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medcost","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)"],insurance_inactive:["Amerihealth Next","Cigna","DirectNET","Humana","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military","Wellcare (Medicare)"]},
  {id:46,name:"Nekita Beach",credentials:"LCMHC",role:"Adult Therapist",department:"Raleigh",ages:"16+",location:["Raleigh","Virtual"],expertise:["Anxiety Disorders","Family and Couples","Grief","Mood Disorders","PTSD/Trauma","Self-Harm & Suicidality","Substance Use Conditions","Women's Mental Health"],conditions:GBO_C,insurance_active:["Alliance Health Medicaid","Ambetter","Amerihealth Next","BCBS","Gateway","HealthTeam","Humana","Medcost","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct (12/1/25)","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military"],insurance_inactive:["Aetna","Cigna","DirectNET"]},
  {id:47,name:"Taylor Burleson",credentials:"LCMHCA",role:"Adult Associate Therapist",department:"Raleigh",ages:"16+",location:["Raleigh","Virtual"],expertise:["Anxiety Disorders","Grief","LGBTQ+","Men's Mental Health","Mood Disorders","Movement Therapy","Sexual Health","Women's Mental Health"],conditions:GBO_C,insurance_active:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medcost","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct (12/1/25)","Medicare"],insurance_inactive:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military"]},
  {id:48,name:"Gabriele Duzer",credentials:"LCSWA",role:"Adult Associate Therapist",department:"Raleigh",ages:"16+",location:["Raleigh","Virtual"],expertise:["ADHD","Anxiety Disorders","Eating Disorders","LGBTQ+","Mood Disorders","PTSD/Trauma","Sexual Health","Women's Mental Health"],conditions:GBO_C,insurance_active:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)"],insurance_inactive:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military"]},
  {id:49,name:"Brooke Smithson",credentials:"LCMHCA",role:"General Associate Therapist",department:"Durham",ages:"10+",location:["Durham","Virtual"],expertise:["ADHD","Anxiety Disorders","Grief","Mood Disorders","Play Therapy","PTSD/Trauma","Women's Mental Health"],conditions:GBO_C,insurance_active:["Aetna","Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)"],insurance_inactive:["Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military","Wellcare (Medicare)"]},
  {id:50,name:"Emily Spain",credentials:"LCMHCA",role:"General Associate Therapist",department:"Durham",ages:"10+",location:["Durham","Virtual"],expertise:["ADHD","Anxiety Disorders","Autism","Chronic Pain","Eating Disorders","Grief","LGBTQ+","Men's Mental Health","Mood Disorders","PTSD/Trauma","Self-Harm & Suicidality","Women's Mental Health"],conditions:GBO_C2,insurance_active:["Aetna","Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct (12/1/25)"],insurance_inactive:["Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military","Wellcare (Medicare)"]},
  {id:51,name:"Tryzhane Dauenay",credentials:"LCMHCA",role:"Adult Associate Therapist (Bilingual French)",department:"Durham",ages:"16+",location:["Durham","Virtual"],expertise:["ADHD","Childhood Behavioral Disorders","Family and Couples","Grief","Bilingual: French"],conditions:GBO_C,insurance_active:["Alliance Health Medicaid","Ambetter","BCBS","DirectNET","Gateway","HealthTeam","Medcost","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct (12/1/25)"],insurance_inactive:["Aetna","Amerihealth Next","Cigna","Humana","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military"]},
  {id:52,name:"Termine Hacker",credentials:"LCMHCA",role:"General Associate Therapist",department:"Durham",ages:"10+",location:["Durham","Virtual"],expertise:["ADHD","Anxiety Disorders","Autism","Eating Disorders","Grief","LGBTQ+","Movement Therapy","Mood Disorders","PTSD/Trauma","Self-Harm & Suicidality","Women's Mental Health"],conditions:GBO_C,insurance_active:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)"],insurance_inactive:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Medicare","Blue Medicare","UBH/UHC/Optum","TriCare/Humana Military"]},
  {id:53,name:"Ana Marques",credentials:"LCMHCA",role:"Associate General Therapist",department:"Durham",ages:"16+",location:["Durham","Virtual"],expertise:["Anxiety Disorders","Chronic Pain","Grief","LGBTQ+","Men's Mental Health","PTSD/Trauma","Sexual Health","Women's Mental Health"],conditions:GBO_C,insurance_active:["Aetna","Alliance Health Medicaid","Ambetter","BCBS","DirectNET","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Wellcare (Medicaid)","Healthy Blue","UHC Community Plan","Partners","Partners Direct (12/1/25)"],insurance_inactive:["Amerihealth Next","Cigna","Humana","Medcost","Medicare","Blue Medicare","UBH/UHC/Optum"]},
];

const INITIAL_PROVIDERS = RAW_PROVIDERS.map(p => {
  let active = normalize(p.insurance_active);
  let inactive = normalize(p.insurance_inactive).filter(i => !active.includes(i));
  if (!active.includes("BCBS")) active = [...active, "BCBS"];
  inactive = inactive.filter(i => i !== "BCBS");
  return { ...p, insurance_active: active, insurance_inactive: inactive };
});

// ── Provider UI ───────────────────────────────────────────────────────────────
const PD = { bg:"#18181b",surface:"#27272a",surface2:"#3f3f46",border:"#52525b",text:"#f4f4f5",text2:"#a1a1aa",text3:"#71717a" };

function PDAvatar({ name, dept }) {
  const initials = name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const c = DEPT_COLORS[dept] || "#888";
  return <div style={{width:40,height:40,borderRadius:"50%",background:c+"33",border:`2px solid ${c}66`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:500,fontSize:12,color:c,flexShrink:0}}>{initials}</div>;
}

function PDPill({ dept }) {
  const c = DEPT_COLORS[dept] || "#888";
  return <span style={{padding:"2px 8px",borderRadius:999,fontSize:11,fontWeight:500,background:c+"22",color:c,border:`1px solid ${c}55`}}>{dept}</span>;
}

function PDTagInput({ label, values, onChange }) {
  const [val, setVal] = useState("");
  const add = () => { const t=val.trim(); if(t&&!values.includes(t)){onChange([...values,t]);setVal("");} };
  return (
    <div style={{marginBottom:12}}>
      <label style={{fontSize:11,color:PD.text3,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>{label}</label>
      <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6}}>
        {values.map(v=>(
          <span key={v} style={{fontSize:11,padding:"2px 8px",borderRadius:6,background:PD.surface2,border:`1px solid ${PD.border}`,display:"flex",alignItems:"center",gap:4,color:PD.text}}>
            {v}<span onClick={()=>onChange(values.filter(x=>x!==v))} style={{cursor:"pointer",color:PD.text3,fontSize:14,lineHeight:1}}>×</span>
          </span>
        ))}
      </div>
      <div style={{display:"flex",gap:6}}>
        <input value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();add();}}}
          placeholder={`Add ${label.toLowerCase()}...`}
          style={{flex:1,fontSize:12,padding:"6px 10px",border:`1px solid ${PD.border}`,borderRadius:7,background:PD.surface2,color:PD.text,outline:"none"}}/>
        <button onClick={add} style={{fontSize:12,padding:"6px 12px",border:`1px solid ${PD.border}`,borderRadius:7,background:PD.surface2,cursor:"pointer",color:PD.text}}>Add</button>
      </div>
    </div>
  );
}

function PDModal({ provider, onSave, onClose }) {
  const [form, setForm] = useState(provider);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const valid = form.name.trim()&&form.credentials.trim()&&form.department;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:999,overflowY:"auto",padding:"30px 16px"}}>
      <div style={{background:PD.surface,border:`1px solid ${PD.border}`,borderRadius:14,width:"100%",maxWidth:560,padding:24}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <h2 style={{fontSize:16,fontWeight:500,color:PD.text,margin:0}}>{form.id?"Edit provider":"Add provider"}</h2>
          <button onClick={onClose} style={{fontSize:20,border:"none",background:"none",cursor:"pointer",color:PD.text3,lineHeight:1}}>×</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          {[["Full name","name"],["Credentials","credentials"],["Role","role"],["Age range","ages"]].map(([lbl,key])=>(
            <div key={key}>
              <label style={{fontSize:11,color:PD.text3,display:"block",marginBottom:4,textTransform:"uppercase"}}>{lbl}</label>
              <input value={form[key]} onChange={e=>set(key,e.target.value)}
                style={{width:"100%",fontSize:12,padding:"7px 10px",border:`1px solid ${PD.border}`,borderRadius:7,background:PD.surface2,color:PD.text,boxSizing:"border-box",outline:"none"}}/>
            </div>
          ))}
        </div>
        <div style={{marginBottom:12}}>
          <label style={{fontSize:11,color:PD.text3,display:"block",marginBottom:4,textTransform:"uppercase"}}>Department</label>
          <select value={form.department} onChange={e=>set("department",e.target.value)}
            style={{width:"100%",fontSize:12,padding:"7px 10px",border:`1px solid ${PD.border}`,borderRadius:7,background:PD.surface2,color:PD.text,outline:"none"}}>
            {PROVIDER_DEPTS.filter(d=>d!=="All").map(d=><option key={d}>{d}</option>)}
          </select>
        </div>
        <PDTagInput label="Locations" values={form.location} onChange={v=>set("location",v)}/>
        <PDTagInput label="Expertise" values={form.expertise} onChange={v=>set("expertise",v)}/>
        <PDTagInput label="Conditions treated" values={form.conditions} onChange={v=>set("conditions",v)}/>
        <PDTagInput label="Active insurance" values={form.insurance_active} onChange={v=>set("insurance_active",v)}/>
        <PDTagInput label="Inactive insurance" values={form.insurance_inactive} onChange={v=>set("insurance_inactive",v)}/>
        <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:16,borderTop:`1px solid ${PD.border}`,paddingTop:16}}>
          <button onClick={onClose} style={{padding:"7px 16px",fontSize:12,border:`1px solid ${PD.border}`,borderRadius:7,background:"transparent",cursor:"pointer",color:PD.text2}}>Cancel</button>
          <button disabled={!valid} onClick={()=>onSave(form)}
            style={{padding:"7px 16px",fontSize:12,border:`1px solid ${valid?"#16a34a":"#3f3f46"}`,borderRadius:7,background:valid?"#14532d":"transparent",cursor:valid?"pointer":"default",fontWeight:500,color:valid?"#4ade80":PD.text3}}>
            Save provider
          </button>
        </div>
      </div>
    </div>
  );
}

function ProviderCard({ p, onEdit, onDelete, canEdit }) {
  const [exp, setExp] = useState(false);
  return (
    <div style={{background:PD.surface,border:`1px solid ${PD.border}`,borderRadius:12,overflow:"hidden"}}>
      <div style={{padding:"14px 16px",display:"flex",gap:12,alignItems:"flex-start"}}>
        <PDAvatar name={p.name} dept={p.department}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:6,marginBottom:4}}>
            <span style={{fontWeight:500,fontSize:14,color:PD.text}}>{p.name}, {p.credentials}</span>
            <PDPill dept={p.department}/>
          </div>
          <div style={{fontSize:11,color:PD.text3,marginBottom:6}}>{p.role} · Ages {p.ages} · {p.location.join(", ")}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
            {p.expertise.map(e=><span key={e} style={{fontSize:10,padding:"2px 6px",borderRadius:5,background:PD.surface2,color:PD.text2,border:`1px solid ${PD.border}`}}>{e}</span>)}
          </div>
        </div>
        <div style={{display:"flex",gap:5,flexShrink:0}}>
          {canEdit&&<button onClick={()=>onEdit(p)} style={{fontSize:11,padding:"4px 10px",border:`1px solid ${PD.border}`,borderRadius:7,background:"transparent",color:PD.text2,cursor:"pointer"}}>Edit</button>}
          <button onClick={()=>setExp(x=>!x)} style={{fontSize:11,padding:"4px 10px",border:`1px solid ${exp?"#71717a":PD.border}`,borderRadius:7,background:exp?PD.surface2:"transparent",color:exp?PD.text:PD.text2,cursor:"pointer"}}>
            {exp?"Hide ▲":"Details ▼"}
          </button>
        </div>
      </div>
      {exp&&(
        <div style={{borderTop:`1px solid ${PD.border}`,padding:"14px 16px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div>
            <div style={{fontSize:10,fontWeight:500,color:PD.text3,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Conditions treated</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
              {p.conditions.map(c=><span key={c} style={{fontSize:10,padding:"2px 6px",borderRadius:5,background:"#052e16",color:"#4ade80",border:"1px solid #166534"}}>{c}</span>)}
            </div>
          </div>
          <div>
            <div style={{fontSize:10,fontWeight:500,color:PD.text3,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Insurance</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
              {p.insurance_active.map(i=><span key={i} style={{fontSize:10,padding:"2px 6px",borderRadius:5,background:"#052e16",color:"#4ade80",border:"1px solid #166534"}}>{i}</span>)}
              {p.insurance_inactive.map(i=><span key={i} style={{fontSize:10,padding:"2px 6px",borderRadius:5,background:"#1c1917",color:"#78716c",border:"1px solid #44403c",textDecoration:"line-through"}}>{i}</span>)}
            </div>
            {p.insurance_inactive.length>0&&<div style={{fontSize:10,color:PD.text3,marginTop:6}}>Strikethrough = no longer accepted</div>}
          </div>
          {canEdit&&(
            <div style={{gridColumn:"1/-1",display:"flex",justifyContent:"flex-end",paddingTop:4,borderTop:`1px solid ${PD.border}`}}>
              <button onClick={()=>onDelete(p.id)} style={{fontSize:11,padding:"4px 10px",border:"1px solid #7f1d1d",borderRadius:7,background:"transparent",color:"#f87171",cursor:"pointer"}}>Remove provider</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProviderDirectory({ canEdit }) {
  const [providers, setProviders] = useState(INITIAL_PROVIDERS);
  const [dept, setDept] = useState("All");
  const [search, setSearch] = useState("");
  const [filterIns, setFilterIns] = useState("");
  const [filterAge, setFilterAge] = useState("");
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);

  const save = (form) => {
    if (form.id) setProviders(ps=>ps.map(p=>p.id===form.id?form:p));
    else setProviders(ps=>[...ps,{...form,id:Date.now()}]);
    setEditing(null); setAdding(false);
  };
  const del = (id) => { if(window.confirm("Remove this provider?")) setProviders(ps=>ps.filter(p=>p.id!==id)); };

  const allIns = useMemo(()=>[...new Set(providers.flatMap(p=>p.insurance_active))].sort(),[providers]);
  const filtered = useMemo(()=>providers.filter(p=>{
    if(dept!=="All"&&p.department!==dept)return false;
    if(filterIns&&!p.insurance_active.includes(filterIns))return false;
    if(filterAge){
      const age=parseInt(filterAge);
      const min=parseInt(p.ages.match(/^(\d+)/)?.[1]||"0");
      const max=parseInt(p.ages.match(/[–\-](\d+)/)?.[1]||"999");
      if(age<min||age>max)return false;
    }
    if(search){
      const s=search.toLowerCase();
      return p.name.toLowerCase().includes(s)||p.expertise.some(e=>e.toLowerCase().includes(s))||p.conditions.some(c=>c.toLowerCase().includes(s))||p.department.toLowerCase().includes(s)||p.location.some(l=>l.toLowerCase().includes(s));
    }
    return true;
  }),[providers,dept,search,filterIns,filterAge]);

  const deptCounts = useMemo(()=>{
    const m={};
    PROVIDER_DEPTS.forEach(d=>{m[d]=d==="All"?providers.length:providers.filter(p=>p.department===d).length;});
    return m;
  },[providers]);

  const activeDepts = PROVIDER_DEPTS.filter(d=>d==="All"||deptCounts[d]>0);

  return (
    <div style={{background:PD.bg,minHeight:"100%",paddingBottom:40}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:16,paddingBottom:16,borderBottom:`1px solid ${PD.border}`}}>
        <span style={{fontSize:13,color:PD.text3}}>{providers.length} providers · {activeDepts.length-1} departments</span>
        {canEdit&&<button onClick={()=>setAdding(true)} style={{padding:"7px 14px",fontSize:12,border:"1px solid #16a34a",borderRadius:8,background:"#14532d",cursor:"pointer",fontWeight:500,color:"#4ade80"}}>+ Add provider</button>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:8,marginBottom:16}}>
        {[["Total",providers.length],["Departments",activeDepts.length-1],["Insurance plans",allIns.length],["Locations",[...new Set(providers.flatMap(p=>p.location))].length]].map(([l,v])=>(
          <div key={l} style={{background:PD.surface,border:`1px solid ${PD.border}`,borderRadius:9,padding:"12px 14px"}}>
            <div style={{fontSize:10,color:PD.text3,marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>{l}</div>
            <div style={{fontSize:22,fontWeight:500,color:PD.text}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:14}}>
        {activeDepts.map(d=>{
          const active=dept===d; const c=DEPT_COLORS[d]||"#888";
          return(
            <button key={d} onClick={()=>setDept(d)}
              style={{padding:"5px 12px",fontSize:12,borderRadius:8,cursor:"pointer",border:active?`1.5px solid ${c}`:`1px solid ${PD.border}`,background:active?c+"22":"transparent",color:active?c:PD.text2,fontWeight:active?500:400}}>
              {d} <span style={{marginLeft:4,fontSize:10,padding:"1px 5px",borderRadius:999,background:active?c+"33":PD.surface2,color:active?c:PD.text3}}>{deptCounts[d]}</span>
            </button>
          );
        })}
      </div>
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, expertise, condition..."
          style={{flex:2,minWidth:160,fontSize:12,padding:"8px 10px",border:`1px solid ${PD.border}`,borderRadius:8,background:PD.surface,color:PD.text,outline:"none"}}/>
        <select value={filterIns} onChange={e=>setFilterIns(e.target.value)}
          style={{flex:1,minWidth:160,fontSize:12,padding:"8px 10px",border:`1px solid ${filterIns?"#16a34a":PD.border}`,borderRadius:8,background:filterIns?"#14532d":PD.surface,color:filterIns?"#4ade80":PD.text,outline:"none"}}>
          <option value="">All insurance plans</option>
          {allIns.map(i=><option key={i}>{i}</option>)}
        </select>
        <input value={filterAge} onChange={e=>setFilterAge(e.target.value.replace(/\D/g,""))} placeholder="Filter by age..."
          style={{width:120,fontSize:12,padding:"8px 10px",border:`1px solid ${filterAge?"#16a34a":PD.border}`,borderRadius:8,background:filterAge?"#14532d":PD.surface,color:filterAge?"#4ade80":PD.text,outline:"none"}}/>
        {(search||filterIns||filterAge)&&(
          <button onClick={()=>{setSearch("");setFilterIns("");setFilterAge("");}}
            style={{fontSize:12,padding:"8px 12px",border:"1px solid #7f1d1d",borderRadius:8,background:"transparent",cursor:"pointer",color:"#f87171"}}>Clear ×</button>
        )}
      </div>
      <div style={{fontSize:11,color:PD.text3,marginBottom:12}}>Showing {filtered.length} of {providers.length} providers{dept!=="All"?` in ${dept}`:""}</div>
      {filtered.length===0
        ?<div style={{textAlign:"center",padding:"3rem 0",color:PD.text3,fontSize:13}}>No providers found. {canEdit&&<button onClick={()=>setAdding(true)} style={{color:"#4ade80",background:"none",border:"none",cursor:"pointer",fontSize:13}}>Add one?</button>}</div>
        :<div style={{display:"flex",flexDirection:"column",gap:8}}>{filtered.map(p=><ProviderCard key={p.id} p={p} onEdit={setEditing} onDelete={del} canEdit={canEdit}/>)}</div>
      }
      {(editing||adding)&&(
        <PDModal provider={editing||{id:null,name:"",credentials:"",role:"",department:"Greenville",ages:"",expertise:[],location:[],conditions:[],insurance_active:[],insurance_inactive:[]}}
          onSave={save} onClose={()=>{setEditing(null);setAdding(false);}}/>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getWeekKey(date=new Date()){const d=new Date(date);d.setHours(0,0,0,0);d.setDate(d.getDate()-d.getDay());return d.toISOString().split("T")[0];}
function getLast26Weeks(){const weeks=[],now=new Date();for(let i=25;i>=0;i--){const d=new Date(now);d.setDate(d.getDate()-d.getDay()-i*7);weeks.push(getWeekKey(d));}return weeks;}
function daysAgo(ts){return Math.floor((Date.now()-new Date(ts).getTime())/86400000);}
function getBadges(status,comments,isMain){
  const badges=[],pc=(comments||[]).filter(c=>c.status==="pending").length;
  if(status==="red"&&pc>=3)badges.push({label:"High Risk",icon:"🔥",cls:"bg-red-500/20 text-red-300 border-red-500/40"});
  if(isMain&&status==="red")badges.push({label:"High Impact",icon:"⭐",cls:"bg-yellow-500/20 text-yellow-300 border-yellow-500/40"});
  return badges;
}

function Gauge({value,target,label,unit,higherIsBetter}){
  const has=value!==""&&value!==null&&value!==undefined,num=parseFloat(value);
  let pct=0,color="#475569",sl="No Data";
  if(has){if(target===0){if(num===0){pct=100;color="#10b981";sl="On Target";}else if(num<=3){pct=60;color="#eab308";sl="Close";}else{pct=20;color="#ef4444";sl="Below";}}else if(higherIsBetter){pct=Math.min((num/target)*100,100);color=pct>=100?"#10b981":pct>=85?"#eab308":"#ef4444";sl=pct>=100?"On Target":pct>=85?"Close":"Below";}}
  const circ=Math.PI*54,dash=(pct/100)*circ;
  return(<div className="flex flex-col items-center"><svg viewBox="0 0 120 70" className="w-24 h-14"><path d="M 10 65 A 54 54 0 0 1 110 65" fill="none" stroke="#1e293b" strokeWidth="10" strokeLinecap="round"/><path d="M 10 65 A 54 54 0 0 1 110 65" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}/><text x="60" y="58" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{has?`${value}${unit}`:"—"}</text></svg><div className="text-center"><div className="text-xs text-slate-400 leading-tight px-1">{label}</div><div className="text-xs font-semibold" style={{color}}>{sl}</div><div className="text-xs text-slate-600">Goal: {target===0?"0":`${target}${unit}`}</div></div></div>);
}

function TrendChart({history,metricDef,weeks}){
  const W=300,H=90,pad={l:28,r:8,t:8,b:20},innerW=W-pad.l-pad.r,innerH=H-pad.t-pad.b;
  const vals=weeks.map(w=>history[w]?parseFloat(history[w][metricDef.key]):null);
  const defined=vals.filter(v=>v!==null&&!isNaN(v));
  if(defined.length===0)return<div className="text-center text-slate-500 text-xs py-3">No historical data yet</div>;
  const maxVal=metricDef.target===0?Math.max(...defined,5):Math.max(metricDef.target*1.1,...defined);
  const barW=innerW/weeks.length,toY=v=>pad.t+innerH-((v/maxVal))*innerH,toX=i=>pad.l+i*barW+barW/2;
  const points=vals.map((v,i)=>v!==null&&!isNaN(v)?`${toX(i)},${toY(v)}`:null).filter(Boolean);
  const tY=metricDef.target===0?null:toY(metricDef.target);
  return(<svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20">{tY&&<line x1={pad.l} y1={tY} x2={W-pad.r} y2={tY} stroke="#10b981" strokeWidth="1" strokeDasharray="3 2" opacity="0.5"/>}{vals.map((v,i)=>{if(v===null||isNaN(v))return null;const bh=(v/maxVal)*innerH,color=metricDef.target===0?(v===0?"#10b981":v<=3?"#eab308":"#ef4444"):(v>=metricDef.target?"#10b981":v>=metricDef.target*0.85?"#eab308":"#ef4444");return<rect key={i} x={pad.l+i*barW+barW*0.15} y={toY(v)} width={barW*0.7} height={bh} fill={color} opacity="0.7" rx="1"/>;})}{points.length>1&&<polyline points={points.join(" ")} fill="none" stroke="white" strokeWidth="1.5" opacity="0.7" strokeLinecap="round" strokeLinejoin="round"/>}{weeks.map((w,i)=>i%6===0?<text key={i} x={toX(i)} y={H-4} textAnchor="middle" fill="#64748b" fontSize="7">{w.slice(5)}</text>:null)}</svg>);
}

function DriverCard({driver,idx,divisionName,status,comments,pinnedDrivers,onToggle,onAddComment,onTogglePin}){
  const [expanded,setExpanded]=useState(false),[hovered,setHovered]=useState(false),[editingComment,setEditingComment]=useState(false),[commentText,setCommentText]=useState(""),[selectedUser,setSelectedUser]=useState(TEAM_MEMBERS[0]),[commentStatus,setCommentStatus]=useState("pending");
  const isPinned=pinnedDrivers.includes(`${divisionName}-${idx}`),isMain=idx===0,badges=getBadges(status,comments,isMain);
  const assignedMembers=[...new Set((comments||[]).map(c=>c.author))];
  const lastUpdated=comments?.length?comments.reduce((a,b)=>new Date(a.timestamp)>new Date(b.timestamp)?a:b):null;
  const handleSave=()=>{if(!commentText.trim())return;onAddComment(divisionName,idx,{text:commentText.trim(),author:selectedUser,status:commentStatus,timestamp:new Date().toISOString()});setCommentText("");setEditingComment(false);};
  return(
    <div className={`rounded-lg border transition-all ${status==="green"?"border-emerald-700/40 bg-emerald-950/20":"border-red-700/40 bg-red-950/20"} ${isPinned?"ring-2 ring-yellow-500/50":""}`} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}>
      <div className="flex items-start gap-2 p-3 cursor-pointer" onClick={()=>setExpanded(e=>!e)}>
        <button onClick={e=>{e.stopPropagation();onToggle();}} className={`mt-0.5 w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center hover:scale-110 transition-all ${status==="green"?"border-emerald-500 bg-emerald-500/20":"border-red-500 bg-red-500/20"}`}><div className={`w-2.5 h-2.5 rounded-full ${status==="green"?"bg-emerald-400":"bg-red-400"}`}/></button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isMain?"bg-slate-600 text-slate-200":"bg-slate-800 text-slate-400"}`}>{isMain?"MAIN":`P${idx+1}`}</span>
            {badges.map(b=><span key={b.label} className={`text-xs px-1.5 py-0.5 rounded border font-semibold ${b.cls}`}>{b.icon} {b.label}</span>)}
            {comments?.length>0&&<span className="text-xs text-slate-400 flex items-center gap-1"><MessageSquare className="w-3 h-3"/>{comments.length}</span>}
            {lastUpdated&&<span className="text-xs text-slate-500">{daysAgo(lastUpdated.timestamp)}d ago</span>}
            {assignedMembers.length>0&&<span className="text-xs text-slate-400">{assignedMembers.join(", ")}</span>}
          </div>
          <p className="text-sm text-slate-200 leading-snug">{driver}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <div className={`flex gap-1 transition-opacity ${hovered?"opacity-100":"opacity-0"}`}>
            <button onClick={e=>{e.stopPropagation();onTogglePin();}} className={`p-1 rounded ${isPinned?"bg-yellow-500/30 text-yellow-300":"bg-slate-700 text-slate-400"}`}><Pin className="w-3 h-3"/></button>
            <button onClick={e=>{e.stopPropagation();setExpanded(true);setEditingComment(true);}} className="p-1 rounded bg-slate-700 text-slate-400"><MessageSquare className="w-3 h-3"/></button>
          </div>
          {expanded?<ChevronUp className="w-3.5 h-3.5 text-slate-500"/>:<ChevronDown className="w-3.5 h-3.5 text-slate-500"/>}
        </div>
      </div>
      {expanded&&(<div className="border-t border-slate-800 px-3 py-2 space-y-2">
        {(comments||[]).map((c,ci)=>(<div key={ci} className={`border-l-4 pl-3 py-1.5 rounded-r text-xs ${c.status==="pending"?"border-yellow-500 bg-yellow-900/20":"border-blue-500 bg-blue-900/20"}`}><div className="flex justify-between gap-2"><div><span className="font-bold text-white mr-2">{c.author}</span><span className={`px-1.5 py-0.5 rounded border font-semibold ${c.status==="pending"?"bg-yellow-500/20 text-yellow-300 border-yellow-500/50":"bg-blue-500/20 text-blue-300 border-blue-500/50"}`}>{c.status==="pending"?"PENDING":"COMPLETE"}</span><span className="text-slate-500 ml-2">{daysAgo(c.timestamp)}d ago</span><p className="text-slate-300 mt-1">{c.text}</p></div><div className="flex gap-1 flex-shrink-0"><button onClick={()=>onAddComment(divisionName,idx,null,ci)} className="p-1 rounded bg-slate-700 text-slate-300"><Check className="w-3 h-3"/></button><button onClick={()=>onAddComment(divisionName,idx,null,ci,true)} className="p-1 rounded bg-red-900/40 text-red-400"><X className="w-3 h-3"/></button></div></div></div>))}
        {editingComment?(<div className="bg-slate-800/60 border border-slate-700 rounded-lg p-2 space-y-2"><div className="flex gap-2"><select value={selectedUser} onChange={e=>setSelectedUser(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 rounded p-1 text-xs">{TEAM_MEMBERS.map(m=><option key={m}>{m}</option>)}</select><select value={commentStatus} onChange={e=>setCommentStatus(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 rounded p-1 text-xs"><option value="pending">Pending</option><option value="complete">Complete</option></select></div><textarea value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Add a comment..." autoFocus className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded p-1.5 text-xs min-h-[50px] placeholder-slate-600"/><div className="flex gap-2"><button onClick={handleSave} className="px-2 py-1 bg-emerald-600 text-white text-xs font-bold rounded">Save</button><button onClick={()=>setEditingComment(false)} className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">Cancel</button></div></div>):(<button onClick={()=>setEditingComment(true)} className="text-xs text-emerald-400 font-semibold flex items-center gap-1"><Plus className="w-3 h-3"/> Add Comment</button>)}
      </div>)}
    </div>
  );
}

function DivisionMetricsSection({division,metricsHistory,assignedTo,currentUser,isAdmin,onEnterMetrics}){
  const [showHistory,setShowHistory]=useState(false);
  const divMetrics=DIVISION_METRICS[division]||[],weeks=getLast26Weeks(),currentWeek=getWeekKey(),currentData=metricsHistory[currentWeek]||{};
  const hasCurrentData=divMetrics.some(dm=>currentData[dm.key]!==""&&currentData[dm.key]!==undefined);
  const canEdit=currentUser===assignedTo||isAdmin;
  return(<div className="mb-3 bg-slate-800/40 rounded-lg border border-slate-700/50"><div className="flex items-center justify-between px-3 py-2 border-b border-slate-700/50"><div className="flex items-center gap-2"><span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Weekly Metrics</span>{assignedTo&&<span className="text-xs text-slate-500">· {assignedTo}</span>}{canEdit&&!hasCurrentData&&<span className="text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-1.5 py-0.5 rounded font-semibold animate-pulse">Entry Needed</span>}</div><div className="flex items-center gap-2">{canEdit&&<button onClick={()=>onEnterMetrics(division)} className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded">{hasCurrentData?"Update":"Enter"}</button>}<button onClick={()=>setShowHistory(h=>!h)} className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1">Trend {showHistory?<ChevronUp className="w-3 h-3"/>:<ChevronDown className="w-3 h-3"/>}</button></div></div>
  <div className="p-3">{!hasCurrentData?<div className="text-center py-2 text-slate-500 text-xs">{canEdit?"Click Enter to add this week's metrics":"Waiting for metrics"}</div>:<div className={`grid gap-2 ${divMetrics.length===1?"grid-cols-1 max-w-[100px] mx-auto":divMetrics.length===2?"grid-cols-2":"grid-cols-3"}`}>{divMetrics.map(dm=><Gauge key={dm.key} value={currentData[dm.key]} target={dm.target} label={dm.label} unit={dm.unit} higherIsBetter={dm.higherIsBetter}/>)}</div>}</div>
  {showHistory&&<div className="border-t border-slate-700/50 p-3 space-y-3"><p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Last 6 Months</p>{divMetrics.map(dm=><div key={dm.key}><p className="text-xs text-slate-400 mb-1">{dm.label}</p><TrendChart history={metricsHistory} metricDef={dm} weeks={weeks}/></div>)}</div>}
  </div>);
}

function DivisionPanel({division,statuses,comments,pinnedDrivers,onToggle,onAddComment,onTogglePin,metricsHistory,assignments,currentUser,isAdmin,onEnterMetrics,meetingMode=false,filters={}}){
  const drivers=division.drivers,greenCount=drivers.filter((_,i)=>statuses[i]==="green").length,pct=Math.round((greenCount/drivers.length)*100);
  const visibleDrivers=drivers.filter((_,i)=>{const s=statuses[i],c=comments[i]||[];if(meetingMode)return s==="red"||c.some(x=>x.status==="pending");if(filters.status==="red")return s==="red";if(filters.status==="green")return s==="green";return true;});
  const pinned=visibleDrivers.filter(d=>pinnedDrivers.includes(`${division.name}-${drivers.indexOf(d)}`));
  const sorted=[...pinned,...visibleDrivers.filter(d=>!pinned.includes(d))];
  return(<div className="bg-slate-900 rounded-xl border border-slate-800 p-4"><div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800"><h3 className="text-base font-bold text-white">{division.name}</h3><div className="flex items-center gap-2"><span className="text-xs text-slate-400">{pct}%</span><span className={`text-xs font-semibold px-2 py-0.5 rounded ${pct===100?"bg-emerald-500/20 text-emerald-300":pct>=60?"bg-yellow-500/20 text-yellow-300":"bg-red-500/20 text-red-300"}`}>{greenCount}/{drivers.length}</span></div></div><div className="h-1.5 bg-slate-800 rounded-full mb-3 overflow-hidden"><div className="h-full rounded-full" style={{width:`${pct}%`,background:pct===100?"#10b981":pct>=60?"#eab308":"#ef4444"}}/></div>
  {DIVISION_METRICS[division.name]&&<DivisionMetricsSection division={division.name} metricsHistory={metricsHistory[division.name]||{}} assignedTo={assignments[division.name]} currentUser={currentUser} isAdmin={isAdmin} onEnterMetrics={onEnterMetrics}/>}
  <div className="space-y-2">{sorted.length===0?<p className="text-slate-500 text-sm text-center py-3">No drivers match current filter</p>:sorted.map(driver=>{const ri=drivers.indexOf(driver);return<DriverCard key={ri} driver={driver} idx={ri} divisionName={division.name} status={statuses[ri]} comments={comments[ri]} pinnedDrivers={pinnedDrivers} onToggle={()=>onToggle(division.name,ri)} onAddComment={onAddComment} onTogglePin={()=>onTogglePin(`${division.name}-${ri}`)}/>;})}</div></div>);
}

function EnterMetricsModal({division,history,onSave,onClose}){
  const divMetrics=DIVISION_METRICS[division]||[],weekKey=getWeekKey(),existing=history[weekKey]||{};
  const [form,setForm]=useState(()=>{const f={weekEnding:weekKey};divMetrics.forEach(dm=>{f[dm.key]=existing[dm.key]||"";});return f;});
  return(<div style={{position:"fixed",inset:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.7)"}} onClick={onClose}><div style={{background:"#0f172a",border:"1px solid #334155",borderRadius:"1rem",padding:"1.5rem",width:"100%",maxWidth:"24rem"}} onClick={e=>e.stopPropagation()}><h2 style={{color:"white",fontWeight:"bold",fontSize:"1.1rem",marginBottom:"0.25rem"}}>Enter Weekly Metrics</h2><p style={{color:"#34d399",fontSize:"0.875rem",fontWeight:"600",marginBottom:"1rem"}}>{division} · Week of {weekKey}</p><div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>{divMetrics.map(dm=>(<div key={dm.key}><label style={{display:"block",color:"#94a3b8",fontSize:"0.75rem",fontWeight:"600",marginBottom:"0.25rem"}}>{dm.label}</label><input type="number" value={form[dm.key]} onChange={e=>setForm(f=>({...f,[dm.key]:e.target.value}))} placeholder="Enter value" style={{width:"100%",background:"#1e293b",border:"1px solid #334155",color:"white",borderRadius:"0.5rem",padding:"0.5rem 0.75rem",fontSize:"0.875rem",outline:"none",boxSizing:"border-box"}}/></div>))}</div><div style={{display:"flex",gap:"0.75rem",marginTop:"1.25rem"}}><button onClick={()=>onSave(division,weekKey,form)} style={{flex:1,background:"#059669",color:"white",fontWeight:"bold",padding:"0.625rem",borderRadius:"0.5rem",border:"none",cursor:"pointer"}}>Save</button><button onClick={onClose} style={{flex:1,background:"#334155",color:"#cbd5e1",fontWeight:"bold",padding:"0.625rem",borderRadius:"0.5rem",border:"none",cursor:"pointer"}}>Cancel</button></div></div></div>);
}

function FteDeptCard({division,dept,fte,requisitions,isAdmin,onUpdate}){
  const [editing,setEditing]=useState(false),[localFte,setLocalFte]=useState(fte),[localReqs,setLocalReqs]=useState([...requisitions]),[newReq,setNewReq]=useState("");
  const handleOpen=()=>{setLocalFte(fte);setLocalReqs([...requisitions]);setNewReq("");setEditing(true);};
  const handleSave=()=>{onUpdate(division,dept,{fte:parseInt(localFte)||0,requisitions:localReqs});setEditing(false);};
  const handleAddReq=()=>{if(!newReq.trim())return;setLocalReqs(r=>[...r,newReq.trim()]);setNewReq("");};
  return(<div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:"0.75rem",padding:"1rem"}}><div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"0.75rem",paddingBottom:"0.75rem",borderBottom:"1px solid #1e293b"}}><div><div style={{color:"white",fontWeight:"bold",fontSize:"0.95rem"}}>{dept}</div><div style={{color:"#64748b",fontSize:"0.75rem"}}>{division}</div></div>{isAdmin&&!editing&&<button onClick={handleOpen} style={{background:"#059669",color:"white",border:"none",borderRadius:"0.4rem",padding:"0.3rem 0.6rem",fontSize:"0.75rem",fontWeight:"bold",cursor:"pointer"}}>Edit</button>}{isAdmin&&editing&&<div style={{display:"flex",gap:"0.4rem"}}><button onClick={handleSave} style={{background:"#059669",color:"white",border:"none",borderRadius:"0.4rem",padding:"0.3rem 0.6rem",fontSize:"0.75rem",fontWeight:"bold",cursor:"pointer"}}>Save</button><button onClick={()=>setEditing(false)} style={{background:"#334155",color:"#cbd5e1",border:"none",borderRadius:"0.4rem",padding:"0.3rem 0.6rem",fontSize:"0.75rem",cursor:"pointer"}}>Cancel</button></div>}</div>
  <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"0.75rem"}}><div style={{width:"2.75rem",height:"2.75rem",background:"rgba(16,185,129,0.15)",border:"1px solid rgba(16,185,129,0.4)",borderRadius:"0.6rem",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{editing?<input type="number" min="0" value={localFte} onChange={e=>setLocalFte(e.target.value)} style={{width:"2.2rem",background:"transparent",border:"none",color:"#34d399",fontWeight:"bold",fontSize:"1rem",textAlign:"center",outline:"none"}}/>:<span style={{color:"#34d399",fontWeight:"bold",fontSize:"1.2rem"}}>{fte}</span>}</div><div><div style={{color:"white",fontSize:"0.875rem",fontWeight:"600"}}>Current FTEs</div><div style={{color:"#64748b",fontSize:"0.75rem"}}>Full-time equivalents</div></div></div>
  <div><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.4rem"}}><span style={{color:"#94a3b8",fontSize:"0.7rem",fontWeight:"600",textTransform:"uppercase",letterSpacing:"0.05em"}}>Open Requisitions</span>{(editing?localReqs:requisitions).length>0&&<span style={{background:"rgba(234,179,8,0.2)",color:"#fde047",border:"1px solid rgba(234,179,8,0.4)",borderRadius:"0.3rem",padding:"0.1rem 0.4rem",fontSize:"0.7rem",fontWeight:"bold"}}>{(editing?localReqs:requisitions).length}</span>}</div>
  {!editing&&(requisitions.length===0?<p style={{color:"#475569",fontSize:"0.75rem",fontStyle:"italic"}}>No open requisitions</p>:requisitions.map((req,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:"0.4rem",background:"rgba(234,179,8,0.1)",border:"1px solid rgba(234,179,8,0.25)",borderRadius:"0.4rem",padding:"0.35rem 0.5rem",marginBottom:"0.3rem"}}><div style={{width:"0.4rem",height:"0.4rem",borderRadius:"50%",background:"#fbbf24",flexShrink:0}}/><span style={{color:"#fde68a",fontSize:"0.75rem"}}>{req}</span></div>)))}
  {editing&&<div>{localReqs.map((req,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:"0.4rem",background:"#1e293b",border:"1px solid #334155",borderRadius:"0.4rem",padding:"0.35rem 0.5rem",marginBottom:"0.3rem"}}><span style={{flex:1,color:"#e2e8f0",fontSize:"0.75rem"}}>{req}</span><button onClick={()=>setLocalReqs(r=>r.filter((_,ri)=>ri!==i))} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",padding:"0",lineHeight:1,fontSize:"0.85rem"}}>✕</button></div>))}<div style={{display:"flex",gap:"0.4rem",marginTop:"0.4rem"}}><input value={newReq} onChange={e=>setNewReq(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAddReq()} placeholder="Add job title..." style={{flex:1,background:"#1e293b",border:"1px solid #334155",color:"white",borderRadius:"0.4rem",padding:"0.35rem 0.5rem",fontSize:"0.75rem",outline:"none"}}/><button onClick={handleAddReq} style={{background:"#059669",color:"white",border:"none",borderRadius:"0.4rem",padding:"0.35rem 0.6rem",fontSize:"0.75rem",fontWeight:"bold",cursor:"pointer"}}>Add</button></div></div>}
  </div></div>);
}

function HealthCircle({pct}){
  const r=54,circ=2*Math.PI*r,dash=(pct/100)*circ,color=pct>=80?"#10b981":pct>=60?"#eab308":"#ef4444",label=pct>=80?"Excellent":pct>=60?"Good":"At Risk";
  return(<svg viewBox="0 0 130 130" className="w-36 h-36"><circle cx="65" cy="65" r={r} fill="none" stroke="#1e293b" strokeWidth="12"/><circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="12" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 65 65)"/><text x="65" y="60" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">{pct}%</text><text x="65" y="78" textAnchor="middle" fill="#94a3b8" fontSize="11">{label}</text></svg>);
}

function LoginScreen({onLogin}){
  const [u,setU]=useState(""),[p,setP]=useState(""),[err,setErr]=useState("");
  const submit=()=>{const user=LOGINS[u];if(user&&user.password===p)onLogin(u,user.isAdmin,user.isTherapy||false);else setErr("Invalid username or password.");};
  return(<div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 w-full max-w-sm shadow-2xl"><div className="text-center mb-8"><div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg"><svg viewBox="0 0 40 40" className="w-9 h-9" fill="none"><polyline points="6,34 16,20 24,26 34,8" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="27,8 34,8 34,15" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/></svg></div><h1 className="text-2xl font-bold text-white">ABM Division Tracker</h1><p className="text-slate-400 text-sm mt-1">Sign in to continue</p></div><div className="space-y-4"><div><label className="text-xs font-semibold text-slate-400 mb-1 block">Username</label><input value={u} onChange={e=>setU(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500" placeholder="Enter your name"/></div><div><label className="text-xs font-semibold text-slate-400 mb-1 block">Password</label><input type="password" value={p} onChange={e=>setP(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500" placeholder="Enter password"/></div>{err&&<p className="text-red-400 text-xs">{err}</p>}<button onClick={submit} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg transition-colors">Sign In</button></div></div></div>);
}

export default function App(){
  const [currentUser,setCurrentUser]=useState(null),[isAdmin,setIsAdmin]=useState(false),[isTherapy,setIsTherapy]=useState(false);
  const [activePage,setActivePage]=useState("home"),[sidebarOpen,setSidebarOpen]=useState(true);
  const [statuses,setStatuses]=useState(()=>{const s={};departments.forEach(d=>d.divisions.forEach(div=>{s[div.name]=div.drivers.map(()=>"green");}));return s;});
  const [comments,setComments]=useState({}),[pinnedDrivers,setPinnedDrivers]=useState([]);
  const [metricsHistory,setMetricsHistory]=useState({}),[assignments,setAssignments]=useState({});
  const [fteData,setFteData]=useState(DEFAULT_FTE()),[enteringMetricsDiv,setEnteringMetricsDiv]=useState(null);
  const [meetingMode,setMeetingMode]=useState(false),[showMikey,setShowMikey]=useState(false);
  const [dismissedBanner,setDismissedBanner]=useState(false),[filters,setFilters]=useState({status:"all"});

  const toggleStatus=(divName,idx)=>setStatuses(s=>({...s,[divName]:s[divName].map((v,i)=>i===idx?(v==="green"?"red":"green"):v)}));
  const handleComment=(divName,idx,newComment,commentIdx,del=false)=>{
    const key=`${divName}-${idx}`,existing=comments[key]?[...comments[key]]:[];
    let updated;
    if(newComment)updated=[...existing,newComment];
    else if(del)updated=existing.filter((_,i)=>i!==commentIdx);
    else updated=existing.map((c,i)=>i===commentIdx?{...c,status:c.status==="pending"?"complete":"pending"}:c);
    setComments(c=>({...c,[key]:updated}));
  };
  const getComments=(divName,idx)=>comments[`${divName}-${idx}`]||[];
  const handleSaveMetrics=(division,weekKey,form)=>{setMetricsHistory(h=>({...h,[division]:{...(h[division]||{}),[weekKey]:form}}));setEnteringMetricsDiv(null);};
  const handleFteUpdate=(division,dept,data)=>setFteData(f=>({...f,[division]:{...f[division],[dept]:data}}));

  let totalGreen=0,totalRed=0,totalPending=0;
  departments.forEach(d=>d.divisions.forEach(div=>div.drivers.forEach((_,i)=>{statuses[div.name]?.[i]==="red"?totalRed++:totalGreen++;})));
  Object.values(comments).forEach(arr=>(arr||[]).forEach(c=>{if(c.status==="pending")totalPending++;}));
  const totalDrivers=totalGreen+totalRed,healthPct=Math.round((totalGreen/totalDrivers)*100);

  const teamMembers=Object.keys(LOGINS).filter(k=>k!=="TherapyOps");
  const memberScores=teamMembers.map(m=>{let pending=0,complete=0;Object.values(comments).forEach(arr=>(arr||[]).forEach(c=>{if(c.author===m)c.status==="pending"?pending++:complete++;}));return{name:m,pending,complete,total:pending+complete};});
  const actionItems={};teamMembers.forEach(m=>{actionItems[m]=[];});
  departments.forEach(d=>d.divisions.forEach(div=>div.drivers.forEach((driver,idx)=>{getComments(div.name,idx).filter(x=>x.status==="pending").forEach(x=>{if(actionItems[x.author])actionItems[x.author].push({division:div.name,driver,comment:x.text,driverStatus:statuses[div.name]?.[idx],timestamp:x.timestamp,priority:idx===0?"Main":`P${idx+1}`});});})));

  const currentWeek=getWeekKey();
  const myPendingDivisions=useMemo(()=>{if(!currentUser)return[];return Object.keys(DIVISION_METRICS).filter(div=>{if(assignments[div]!==currentUser)return false;const history=metricsHistory[div]||{},divMetrics=DIVISION_METRICS[div]||[],current=history[currentWeek]||{};return!divMetrics.some(dm=>current[dm.key]!==""&&current[dm.key]!==undefined);});},[currentUser,assignments,metricsHistory]);

  if(!currentUser) return <LoginScreen onLogin={(u,admin,therapy)=>{setCurrentUser(u);setIsAdmin(admin);setIsTherapy(therapy);setActivePage(therapy?"providers":"home");}}/>;

  const navItems=isTherapy
    ?[{id:"providers",label:"Providers",icon:Users}]
    :[{id:"home",label:"Home",icon:Home},{id:"tracker",label:"Driver Tracker",icon:Flag},{id:"metrics",label:"Analytics",icon:BarChart3},{id:"actions",label:"Action Items",icon:CheckSquare},{id:"employees",label:"Employees",icon:Users},...(isAdmin?[{id:"providers",label:"Providers",icon:Users},{id:"admin",label:"Admin",icon:Settings}]:[])];

  return(
    <div className="min-h-screen bg-slate-950 flex">
      <div className={`${sidebarOpen?"w-52":"w-14"} bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-200 flex-shrink-0`}>
        <div className="flex items-center gap-3 px-3 py-4 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center flex-shrink-0"><svg viewBox="0 0 40 40" className="w-5 h-5" fill="none"><polyline points="6,34 16,20 24,26 34,8" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="27,8 34,8 34,15" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
          {sidebarOpen&&<div className="min-w-0"><div className="text-sm font-bold text-white leading-tight">ABM</div><div className="text-xs text-slate-400 leading-tight">Clinical Ops</div></div>}
          <button onClick={()=>setSidebarOpen(o=>!o)} className="ml-auto text-slate-500 hover:text-slate-300 flex-shrink-0"><Menu className="w-4 h-4"/></button>
        </div>
        <nav className="flex-1 py-3 space-y-1 px-2">
          {navItems.map(item=>{const Icon=item.icon;return(<button key={item.id} onClick={()=>setActivePage(item.id)} className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors text-left ${activePage===item.id?"bg-emerald-600/20 text-emerald-400":"text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}><Icon className="w-4 h-4 flex-shrink-0"/>{sidebarOpen&&<span className="text-sm font-medium">{item.label}</span>}</button>);})}
        </nav>
        <div className="border-t border-slate-800 p-3"><div className="flex items-center gap-2"><div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{currentUser[0]}</div>{sidebarOpen&&<><div className="flex-1 min-w-0"><div className="text-xs font-semibold text-white truncate">{currentUser}</div><div className="text-xs text-slate-500">{isAdmin?"Admin":isTherapy?"Therapy Ops":"Team"}</div></div><button onClick={()=>{setCurrentUser(null);setIsAdmin(false);setIsTherapy(false);}} className="text-slate-500 hover:text-slate-300 text-xs">Out</button></>}</div></div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
          <div><h1 className="text-lg font-bold text-white">{{home:"Operations Briefing",tracker:"Driver Tracker",metrics:"Analytics",actions:"Action Items",employees:"Employees",providers:"Provider Directory",admin:"Admin"}[activePage]}</h1><p className="text-xs text-slate-400">{new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p></div>
          <div className="flex items-center gap-3">
            {activePage==="tracker"&&<div className="flex rounded-lg overflow-hidden border border-slate-700"><button onClick={()=>setMeetingMode(false)} className={`px-3 py-1.5 text-xs font-semibold transition-colors ${!meetingMode?"bg-slate-700 text-white":"text-slate-400"}`}>Normal</button><button onClick={()=>setMeetingMode(true)} className={`px-3 py-1.5 text-xs font-semibold transition-colors ${meetingMode?"bg-emerald-600 text-white":"text-slate-400"}`}>Meeting</button></div>}
            <button onClick={()=>setShowMikey(true)} className="px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white text-xs rounded-lg border border-green-500 font-bold">🍕 Cowabunga!</button>
          </div>
        </div>

        {myPendingDivisions.length>0&&!dismissedBanner&&(
          <div className="bg-yellow-900/40 border-b border-yellow-600 px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap"><span className="text-yellow-300 font-bold text-sm">📊 Metrics needed: {myPendingDivisions.join(", ")}</span>{myPendingDivisions.map(div=>(<button key={div} onClick={()=>setEnteringMetricsDiv(div)} className="px-2 py-1 bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold rounded transition-colors">Enter {div}</button>))}</div>
            <button onClick={()=>setDismissedBanner(true)} className="text-yellow-500 hover:text-yellow-300"><X className="w-4 h-4"/></button>
          </div>
        )}

        <div className="flex-1 p-6 overflow-auto">
          {activePage==="home"&&(
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[{label:"On Track",value:totalGreen,color:"text-emerald-400",bg:"bg-emerald-500/10 border-emerald-700/30"},{label:"Needs Attention",value:totalRed,color:"text-red-400",bg:"bg-red-500/10 border-red-700/30"},{label:"Pending Actions",value:totalPending,color:"text-yellow-400",bg:"bg-yellow-500/10 border-yellow-700/30"},{label:"Total Drivers",value:totalDrivers,color:"text-white",bg:"bg-slate-800/50 border-slate-700"}].map(s=>(<div key={s.label} className={`${s.bg} rounded-xl border p-4 text-center`}><div className={`text-3xl font-bold ${s.color}`}>{s.value}</div><div className="text-xs text-slate-400 mt-1">{s.label}</div></div>))}
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 flex flex-col items-center">
                  <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">Overall Health</h3>
                  <HealthCircle pct={healthPct}/>
                  <div className="mt-3 w-full space-y-2">{departments.map(dept=>{let g=0,t=0;dept.divisions.forEach(div=>div.drivers.forEach((_,i)=>{t++;if(statuses[div.name]?.[i]==="green")g++;}));const p=Math.round((g/t)*100);return(<div key={dept.name} className="flex items-center gap-2"><span className="text-xs text-slate-400 w-28 truncate">{dept.name}</span><div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{width:`${p}%`,background:p>=80?"#10b981":p>=60?"#eab308":"#ef4444"}}/></div><span className="text-xs text-slate-400 w-8 text-right">{p}%</span></div>);})}</div>
                </div>
                <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 p-5">
                  <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wide">Team Scorecard</h3>
                  <div className="grid gap-3 grid-cols-3">{memberScores.map(m=>(<div key={m.name} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center"><div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto mb-1">{m.name[0]}</div><div className="font-bold text-white text-xs">{m.name}</div><div className="mt-1.5 space-y-0.5 text-xs"><div className="flex justify-between text-slate-400"><span>Pending</span><span className="text-yellow-300 font-bold">{m.pending}</span></div><div className="flex justify-between text-slate-400"><span>Done</span><span className="text-emerald-300 font-bold">{m.complete}</span></div></div>{m.total>0&&<div className="mt-1.5 h-1 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{width:`${Math.round((m.complete/m.total)*100)}%`}}/></div>}</div>))}</div>
                </div>
              </div>
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wide">Needs Attention</h3>
                {totalRed===0?<div className="text-center py-6 text-emerald-400 font-semibold">All drivers on track!</div>:(
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{departments.flatMap(d=>d.divisions.flatMap(div=>div.drivers.map((driver,i)=>({driver,divName:div.name,idx:i,status:statuses[div.name]?.[i]})))).filter(x=>x.status==="red").map((x,i)=>(<div key={i} className="bg-red-950/30 border border-red-700/40 rounded-lg p-3"><div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0"/><span className="text-xs font-semibold text-slate-300">{x.divName}</span><span className="text-xs bg-slate-800 text-slate-400 px-1.5 rounded">{x.idx===0?"MAIN":`P${x.idx+1}`}</span></div><p className="text-xs text-slate-400 leading-snug">{x.driver}</p></div>))}</div>
                )}
              </div>
            </div>
          )}

          {activePage==="tracker"&&(
            <div className="space-y-4">
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-3 flex flex-wrap gap-3 items-center">
                <Filter className="w-4 h-4 text-slate-400"/>
                <div className="flex rounded-lg overflow-hidden border border-slate-700 text-xs">{[["all","All"],["green","On Track"],["red","Needs Attention"]].map(([v,l])=>(<button key={v} onClick={()=>setFilters(f=>({...f,status:v}))} className={`px-3 py-1.5 font-medium transition-colors ${filters.status===v?"bg-slate-700 text-white":"text-slate-400"}`}>{l}</button>))}</div>
              </div>
              {meetingMode&&<div className="bg-emerald-900/40 border border-emerald-700 rounded-xl p-3 text-center"><p className="text-emerald-300 font-bold text-sm">Meeting Mode — Red drivers and pending items only</p></div>}
              {departments.map(dept=>{
                const visibleDivisions=dept.divisions.filter(div=>{const ds=statuses[div.name]||[],dc=div.drivers.reduce((acc,_,i)=>{acc[i]=getComments(div.name,i);return acc;},{});if(meetingMode)return ds.some(s=>s==="red")||Object.values(dc).some(c=>c.some(x=>x.status==="pending"));if(filters.status==="green")return ds.some(s=>s==="green");if(filters.status==="red")return ds.some(s=>s==="red");return true;});
                if(visibleDivisions.length===0)return null;
                return(<div key={dept.name}><div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-3 font-bold text-white text-base" style={{backgroundColor:dept.color}}><Building2 className="w-4 h-4"/> {dept.name}</div><div className="grid gap-4 lg:grid-cols-2">{visibleDivisions.map(div=>(<DivisionPanel key={div.name} division={div} statuses={statuses[div.name]||[]} comments={div.drivers.reduce((acc,_,i)=>{acc[i]=getComments(div.name,i);return acc;},{})} pinnedDrivers={pinnedDrivers} onToggle={toggleStatus} onAddComment={handleComment} onTogglePin={k=>setPinnedDrivers(p=>p.includes(k)?p.filter(x=>x!==k):[...p,k])} metricsHistory={metricsHistory} assignments={assignments} currentUser={currentUser} isAdmin={isAdmin} onEnterMetrics={setEnteringMetricsDiv} meetingMode={meetingMode} filters={filters}/>))}</div></div>);
              })}
            </div>
          )}

          {activePage==="metrics"&&(
            <div className="grid gap-4 lg:grid-cols-2">{Object.keys(DIVISION_METRICS).map(divName=>{const divMetrics=DIVISION_METRICS[divName],weeks=getLast26Weeks(),history=metricsHistory[divName]||{},currentData=history[currentWeek]||{},hasData=divMetrics.some(dm=>currentData[dm.key]!==""&&currentData[dm.key]!==undefined),canEdit=currentUser===assignments[divName]||isAdmin;return(<div key={divName} className="bg-slate-900 rounded-xl border border-slate-800 p-4"><div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800"><h3 className="text-base font-bold text-white">{divName}</h3><div className="flex items-center gap-2">{assignments[divName]&&<span className="text-xs text-slate-500">{assignments[divName]}</span>}{canEdit&&<button onClick={()=>setEnteringMetricsDiv(divName)} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded">{hasData?"Update":"Enter"}</button>}</div></div>{!hasData?<div className="text-center py-4 text-slate-500 text-sm">No data for this week</div>:(<><div className={`grid gap-3 mb-4 ${divMetrics.length===1?"grid-cols-1 max-w-[100px] mx-auto":divMetrics.length===2?"grid-cols-2":"grid-cols-3"}`}>{divMetrics.map(dm=><Gauge key={dm.key} value={currentData[dm.key]} target={dm.target} label={dm.label} unit={dm.unit} higherIsBetter={dm.higherIsBetter}/>)}</div><div className="border-t border-slate-800 pt-3 space-y-3"><p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">6-Month Trend</p>{divMetrics.map(dm=><div key={dm.key}><p className="text-xs text-slate-400 mb-1">{dm.label}</p><TrendChart history={history} metricDef={dm} weeks={weeks}/></div>)}</div></>)}</div>);})}</div>
          )}

          {activePage==="actions"&&(
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{teamMembers.map(m=>{const items=actionItems[m]||[];return(<div key={m} className="bg-slate-900 border border-slate-800 rounded-xl p-4"><div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-800"><div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center text-white font-bold">{m[0]}</div><div><div className="font-bold text-white">{m}</div><div className="text-xs text-slate-400">{items.length} pending</div></div></div>{items.length===0?<div className="text-center py-4 text-slate-500 text-sm">All caught up</div>:<div className="space-y-2">{items.map((it,i)=>(<div key={i} className={`p-2.5 rounded border-l-4 text-xs ${it.driverStatus==="red"?"bg-red-950/30 border-red-500":"bg-slate-700/30 border-emerald-500"}`}><div className="text-slate-400 mb-0.5">{it.division} · {it.priority}</div><div className="text-slate-300 font-medium mb-0.5 leading-snug">{it.driver}</div><div className="text-slate-400 italic">"{it.comment}"</div></div>))}</div>}</div>);})}</div>
          )}

          {activePage==="employees"&&(
            <div className="space-y-8">{Object.entries(fteData).map(([division,depts])=>{const totalFte=Object.values(depts).reduce((sum,d)=>sum+(d.fte||0),0),totalReqs=Object.values(depts).reduce((sum,d)=>sum+d.requisitions.length,0);return(<div key={division}><div className="flex items-center gap-4 mb-4"><h2 className="text-lg font-bold text-white">{division}</h2><span className="text-xs bg-slate-800 border border-slate-700 text-slate-400 px-2 py-1 rounded-lg">{totalFte} FTEs</span>{totalReqs>0&&<span className="text-xs bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 px-2 py-1 rounded-lg">{totalReqs} open req{totalReqs!==1?"s":""}</span>}</div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(depts).map(([dept,data])=>(<FteDeptCard key={dept} division={division} dept={dept} fte={data.fte} requisitions={data.requisitions} isAdmin={isAdmin} onUpdate={handleFteUpdate}/>))}</div></div>);})}
              {!isAdmin&&<p className="text-center text-slate-500 text-sm mt-4">Only Dustin can update FTE counts and requisitions.</p>}
            </div>
          )}

          {activePage==="providers"&&(isTherapy||isAdmin)&&<ProviderDirectory canEdit={isAdmin}/>}

          {activePage==="admin"&&isAdmin&&(
            <div className="space-y-4 max-w-lg">
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-5"><h3 className="text-base font-bold text-white mb-1">Metrics Assignments</h3><p className="text-slate-400 text-sm mb-4">Assign who enters each division's weekly metrics</p><div className="space-y-3">{Object.keys(DIVISION_METRICS).map(div=>(<div key={div} className="flex items-center justify-between gap-3"><span className="text-sm text-slate-300">{div}</span><select value={assignments[div]||""} onChange={e=>setAssignments(a=>({...a,[div]:e.target.value}))} className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500"><option value="">— Unassigned —</option>{teamMembers.map(u=><option key={u} value={u}>{u}</option>)}</select></div>))}</div></div>
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-5"><h3 className="text-base font-bold text-white mb-1">Team Logins</h3><p className="text-slate-400 text-sm mb-4">Share these credentials with your team</p><div className="space-y-2">{Object.entries(LOGINS).map(([u,v])=>(<div key={u} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0"><div className="flex items-center gap-2"><div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center text-white text-xs font-bold">{u[0]}</div><span className="text-sm text-white font-semibold">{u}</span>{v.isAdmin&&<span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">Admin</span>}{v.isTherapy&&<span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/40">Therapy</span>}</div><span className="text-xs text-slate-500 font-mono">{v.password}</span></div>))}</div></div>
            </div>
          )}
        </div>
      </div>

      {showMikey&&(
        <div style={{position:"fixed",inset:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.6)"}} onClick={()=>setShowMikey(false)}>
          <div className="flex flex-col items-center">
            <div className="bg-white text-black font-black text-4xl px-8 py-4 rounded-2xl shadow-2xl mb-2 relative">COWABUNGA, DUDE! 🤙<div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"/></div>
            <svg viewBox="0 0 200 220" className="w-56 h-56 drop-shadow-2xl"><ellipse cx="100" cy="160" rx="55" ry="50" fill="#4a7c2f"/><ellipse cx="100" cy="158" rx="42" ry="38" fill="#8B6914"/><ellipse cx="100" cy="158" rx="36" ry="32" fill="#c4920a"/><line x1="100" y1="126" x2="100" y2="190" stroke="#8B6914" strokeWidth="2"/><line x1="64" y1="158" x2="136" y2="158" stroke="#8B6914" strokeWidth="2"/><ellipse cx="100" cy="85" rx="42" ry="40" fill="#5a9e3a"/><rect x="58" y="72" width="84" height="22" rx="11" fill="#FF6B00"/><path d="M58 78 Q40 70 35 60" stroke="#FF6B00" strokeWidth="4" fill="none" strokeLinecap="round"/><path d="M142 78 Q160 70 165 60" stroke="#FF6B00" strokeWidth="4" fill="none" strokeLinecap="round"/><ellipse cx="83" cy="80" rx="10" ry="9" fill="white"/><ellipse cx="117" cy="80" rx="10" ry="9" fill="white"/><circle cx="85" cy="81" r="5" fill="#1a1a1a"/><circle cx="119" cy="81" r="5" fill="#1a1a1a"/><circle cx="87" cy="79" r="2" fill="white"/><circle cx="121" cy="79" r="2" fill="white"/><path d="M75 100 Q100 125 125 100" stroke="#1a1a1a" strokeWidth="3" fill="#ff9999" strokeLinecap="round"/><path d="M80 102 Q100 120 120 102" fill="#cc4444"/><rect x="88" y="103" width="10" height="8" rx="2" fill="white"/><rect x="101" y="103" width="10" height="8" rx="2" fill="white"/><path d="M48 140 Q20 130 15 150" stroke="#4a7c2f" strokeWidth="14" fill="none" strokeLinecap="round"/><path d="M152 140 Q180 120 190 140" stroke="#4a7c2f" strokeWidth="14" fill="none" strokeLinecap="round"/><circle cx="15" cy="152" r="10" fill="#5a9e3a"/><circle cx="190" cy="142" r="10" fill="#5a9e3a"/><rect x="62" y="170" width="76" height="10" rx="5" fill="#FF6B00"/><rect x="93" y="168" width="14" height="14" rx="3" fill="#FFD700"/></svg>
            <p className="text-white text-sm mt-2 opacity-70">Click anywhere to close</p>
          </div>
        </div>
      )}

      {enteringMetricsDiv&&<EnterMetricsModal division={enteringMetricsDiv} history={metricsHistory[enteringMetricsDiv]||{}} onSave={handleSaveMetrics} onClose={()=>setEnteringMetricsDiv(null)}/>}
    </div>
  );
}
