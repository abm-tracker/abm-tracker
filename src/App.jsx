import { useState, useMemo, useEffect } from "react";
import { X, Check, ChevronDown, ChevronUp, Pin, Plus, BarChart3, MessageSquare, Settings, Home, Flag, CheckSquare, Menu, Users } from "lucide-react";

const SUPABASE_URL = "https://mfqqybvayttxpaupxnuu.supabase.co";
const SUPABASE_KEY = "sb_publishable_JKmwahI3-_PO4bgME3Wqwg_Q2NoeD29";

async function sbGet(table) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
      headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function sbUpsert(table, payload) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
      },
      body: JSON.stringify(payload)
    });
  } catch(e) { console.error("Supabase error", e); }
}

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

const MANAGERS = [
  { name: "Jessica",   departments: ["Ops"] },
  { name: "Ty",        departments: ["Intake","Referrals","Therapy Ops"] },
  { name: "Charlotte", departments: ["Front Desk","PVP"] },
  { name: "Sydni",     departments: ["IT"] },
  { name: "Marco",     departments: ["PC","HIM"] },
  { name: "Dustin",    departments: ["All"] },
];
const ALL_DEPARTMENTS = ["Ops","Intake","Referrals","Therapy Ops","Front Desk","PVP","IT","PC","HIM"];

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
    { key: "inactiveInsurance", label: "Inactive Insurance", target: 0, unit: "", higherIsBetter: false },
  ],
  "PVP": [
    { key: "virtualCopay", label: "Virtual Copay %", target: 82.5, unit: "%", higherIsBetter: true },
    { key: "smallBalances", label: "Small Balances", target: 0, unit: "", higherIsBetter: false },
  ],
  "PC":                 [{ key: "phoneAnswer",        label: "Phone Answer %",             target: 92.5, unit: "%", higherIsBetter: true }],
  "Intake":             [{ key: "phoneAnswer",        label: "Phone Answer %",             target: 92.5, unit: "%", higherIsBetter: true }],
  "Referrals":          [{ key: "referralConversion", label: "Referral Conversion %",      target: 75,   unit: "%", higherIsBetter: true }],
  "Therapy Scheduling": [{ key: "priorityConversion", label: "Priority List Conversion %", target: 75,   unit: "%", higherIsBetter: true }],
  "HIM":                [{ key: "casesOver21",        label: "Cases Over 21 Days",         target: 0,    unit: "",  higherIsBetter: false }],
};

const DEPT_COLORS = {
  "Greenville":"#5DCAA5","Independent Contract":"#EF9F27","Winston-Salem":"#AFA9EC",
  "Greensboro":"#ED93B1","Hickory":"#5DCAA5","Mt. Airy":"#EF9F27","Asheville":"#85B7EB",
  "Charlotte":"#F09595","Raleigh":"#9FE1CB","Durham":"#AFA9EC","Other":"#888780","All":"#888780"
};
const PROVIDER_DEPTS = ["All","Greenville","Independent Contract","Winston-Salem","Greensboro","Hickory","Mt. Airy","Asheville","Charlotte","Raleigh","Durham","Other"];
const STD = ["Aetna","Alliance Health Medicaid","Ambetter","Amerihealth Next","BCBS","Cigna","DirectNET","Gateway","HealthTeam","Humana","Medcost","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military","Wellcare Medicare"];
const GBO_C  = ["ADHD","Anger Management","Anxiety","Bipolar","Depression","Dissociative Disorder","DMDD","Grief","ODD-Mild Conduct","Mild OCD","LGBTQ Affirmative Therapy","Personality Disorders","Postpartum Depression","PTSD-Trauma","Relationships","Schizophrenia","Substance Use","Stress Management","Secondary Mild IDD"];
const GBO_C2 = ["ADHD","Anger Management","Anxiety","Bipolar","Depression","DMDD","Grief","ODD-Conduct Disorder","Mild OCD","Personality Disorders","Postpartum Depression","PTSD-Trauma","Relationships","Schizophrenia","LGBTQ","Secondary Substance Use","Stress Management","Secondary Mild IDD"];
const PED_C  = ["ADHD","Anger Management","Anxiety","Mild Autism","Bipolar Disorder","Depression","DMDD","Grief","ODD-Mild Conduct Disorder","Mild OCD","PTSD-Trauma","Postpartum Depression","Schizophrenia","LGBTQ","Personality Disorders","Play Therapy","Secondary Substance Use","Stress Management","Secondary Mild IDD"];
const HKY_C2 = ["ADHD","Anger Management","Anxiety","Bipolar","Depression","DMDD","Grief","ODD-Conduct Disorder","Mild OCD","Personality Disorders","Postpartum Depression","PTSD-Trauma","Relationships","Schizophrenia","LGBTQ","Secondary Substance Use","Stress Management","Secondary Mild IDD"];
const CLT_C  = ["ADHD","Anger Management","Anxiety","Bipolar","Depression","Dissociative Disorder","DMDD","Grief","ODD-Mild Conduct","Mild OCD","LGBTQ Affirmative Therapy","Personality Disorders","Postpartum Depression","PTSD-Trauma","Relationships","Schizophrenia","Substance Use","Stress Management","Secondary Mild IDD"];
const CLT_C2 = ["ADHD","Anger Management","Anxiety","Bipolar","Depression","DMDD","Grief","ODD-Conduct Disorder","Mild OCD","Personality Disorders","Postpartum Depression","PTSD-Trauma","Relationships","Schizophrenia","LGBTQ","Secondary Substance Use","Stress Management","Secondary Mild IDD","Secondary ODD-Conduct"];

const normIns = (list) => [...new Set(list.map(i => {
  if (i === "Partners" || i === "Partners Medicaid") return "Partners Medicaid";
  if (i === "Wellcare (Medicaid)") return "Carolina Complete Medicaid";
  return i;
}))];

const RAW_PROVIDERS = [
  {id:1,name:"Carly Fields",credentials:"LCMHCA",role:"Pediatric Associate Therapist",department:"Greenville",ages:"6-26",location:["Greenville","Virtual"],expertise:["ADHD","Anxiety","Autism","Mood Disorders","Sexual Health","Substance Use"],conditions:PED_C,ia:["Alliance Health Medicaid","Ambetter","BCBS","DirectNET","HealthTeam","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Aetna","Amerihealth Next","Cigna","Gateway","Humana","Medcost","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military","Wellcare Medicare"]},
  {id:54,name:"Catherine Francis",credentials:"LCSWA",role:"Pediatric Associate Therapist",department:"Greenville",ages:"6-30",location:["Greenville","Virtual"],expertise:["ADHD","Anxiety","Autism","Childhood Behavioral","Grief"],conditions:PED_C,ia:["Aetna","Alliance Health Medicaid","BCBS","DirectNET","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Ambetter","Amerihealth Next","Cigna","Humana","Medcost","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military","Wellcare Medicare"]},
  {id:55,name:"Chelsea McGhee",credentials:"LCSWA",role:"Associate General Therapist",department:"Greenville",ages:"10+",location:["Greenville","Virtual"],expertise:["ADHD","Anxiety","Autism","Childhood Behavioral","Eating Disorders","Family and Couples","Grief","LGBTQ","Mood Disorders","Play Therapy","PTSD-Trauma","Women's Mental Health"],conditions:GBO_C,ia:["Aetna","Alliance Health Medicaid","Ambetter","BCBS","Cigna","DirectNET","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Amerihealth Next","Humana","Medcost","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military","Wellcare Medicare"]},
  {id:2,name:"Lauren Adams",credentials:"LCSW",role:"General Independent Contract Therapist",department:"Independent Contract",ages:"10+",location:["Virtual"],expertise:["EMDR","ADHD","Anxiety","Chronic Pain","Grief","LGBTQ","Mood Disorders","PTSD-Trauma","Women's Mental Health"],conditions:GBO_C,ia:STD,ii:[]},
  {id:3,name:"Sirrell James",credentials:"LCSW",role:"Adult Independent Contract Therapist",department:"Independent Contract",ages:"16+",location:["Virtual"],expertise:["Anxiety","Chronic Pain","Grief","Men's Mental Health","Mood Disorders","PTSD-Trauma","Women's Mental Health"],conditions:GBO_C,ia:["Aetna","Alliance Health Medicaid","Ambetter","Amerihealth Next","BCBS","DirectNET","Gateway","HealthTeam","Humana","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military"],ii:["Cigna","Medcost"]},
  {id:4,name:"Kristy Wood",credentials:"LCMHC",role:"Adult General Therapist IC",department:"Independent Contract",ages:"18+",location:["Virtual"],expertise:["Grief","LGBTQ","PTSD-Trauma"],conditions:GBO_C,ia:["Aetna","Alliance Health Medicaid","Ambetter","Amerihealth Next","BCBS","DirectNET","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military"],ii:["Cigna","Medcost","Wellcare Medicare"]},
  {id:7,name:"Cindy Arrington",credentials:"CRC LCMHC LCAS-A",role:"Adult Addictions Therapist IC",department:"Winston-Salem",ages:"16+",location:["Virtual"],expertise:["ADHD","Anxiety","Autism","Grief","Mood Disorders","PTSD-Trauma","Substance Use"],conditions:GBO_C,ia:STD,ii:[]},
  {id:8,name:"Alena Blue",credentials:"LCMHCA",role:"General Associate Therapist",department:"Winston-Salem",ages:"10+",location:["Winston-Salem","Virtual"],expertise:["ADHD","Anxiety","Childhood Behavioral","Eating Disorders","Family and Couples","LGBTQ","Mood Disorders","PTSD-Trauma","Substance Use","Women's Mental Health"],conditions:GBO_C,ia:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medcost","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military","Wellcare Medicare"]},
  {id:9,name:"Kenzie Cameron",credentials:"LCSW",role:"Pediatric Therapist",department:"Winston-Salem",ages:"6+",location:["Winston-Salem","Virtual"],expertise:["EMDR","ADHD","Anxiety","Childhood Behavioral","Grief","LGBTQ","Mood Disorders","Play Therapy","PTSD-Trauma","Women's Mental Health"],conditions:PED_C,ia:["Aetna","Alliance Health Medicaid","Ambetter","BCBS","DirectNET","Gateway","HealthTeam","Medcost","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military"],ii:["Amerihealth Next","Cigna","Humana","Medicare","Wellcare Medicare"]},
  {id:10,name:"Kimberly Colon",credentials:"LCMHC",role:"General Therapist Spanish-speaking",department:"Winston-Salem",ages:"10+",location:["Winston-Salem","Virtual"],expertise:["EMDR","ADHD","Anxiety","Autism","Childhood Behavioral","Grief","LGBTQ","PTSD-Trauma","Women's Mental Health"],conditions:GBO_C,ia:STD,ii:[]},
  {id:11,name:"Renee Heagney",credentials:"LCMHC NCC BC-DMT",role:"Adult Therapist",department:"Winston-Salem",ages:"16+",location:["Greensboro","Virtual"],expertise:["EMDR","PTSD-Trauma","Movement Therapy"],conditions:GBO_C,ia:STD,ii:[]},
  {id:12,name:"Emily Kirker",credentials:"LCSWA",role:"Adult Associate Therapist",department:"Winston-Salem",ages:"18+",location:["Winston-Salem","Virtual"],expertise:["ADHD","Anxiety","Autism","Grief","LGBTQ","Mood Disorders","Women's Mental Health","Somatic Techniques"],conditions:GBO_C2,ia:["Aetna","Alliance Health Medicaid","Ambetter","Amerihealth Next","BCBS","Cigna","DirectNET","HealthTeam","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military","Wellcare Medicare"],ii:["Humana","Medcost","Gateway"]},
  {id:13,name:"Bria Roddy",credentials:"LCMHCA",role:"Associate Pediatric Therapist",department:"Winston-Salem",ages:"6-40",location:["Winston-Salem","Virtual"],expertise:["ADHD","Anxiety","Autism","Childhood Behavioral","Family and Couples","LGBTQ","Mood Disorders","Play Therapy","Women's Mental Health"],conditions:GBO_C,ia:["Aetna","Alliance Health Medicaid","Ambetter","BCBS","DirectNET","Gateway","HealthTeam","Medcost","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Amerihealth Next","Cigna","Humana","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military","Wellcare Medicare"]},
  {id:14,name:"Kioka Brown",credentials:"LCMHCA",role:"General Associate Therapist",department:"Greensboro",ages:"10+",location:["Greensboro","Virtual"],expertise:["ADHD","Anxiety","Autism","Childhood Behavioral","Family and Couples","Grief","LGBTQ","Mood Disorders","Play Therapy","PTSD-Trauma","Women's Mental Health"],conditions:GBO_C,ia:["Alliance Health Medicaid","Ambetter","BCBS","DirectNET","Gateway","HealthTeam","Medcost","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Aetna","Amerihealth Next","Cigna","Humana","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military"]},
  {id:16,name:"Elise Coffman",credentials:"LCMHCA",role:"General Associate Therapist",department:"Greensboro",ages:"13+",location:["Greensboro","Virtual"],expertise:["ADHD","Anxiety","Autism","Eating Disorders","Grief","LGBTQ","Mood Disorders","PTSD-Trauma","Women's Mental Health"],conditions:GBO_C,ia:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medcost","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military"]},
  {id:17,name:"Dnasia Council",credentials:"LCMHCA",role:"General Associate Therapist",department:"Greensboro",ages:"10+",location:["Greensboro","Virtual"],expertise:["ADHD","Anxiety","Autism","Childhood Behavioral","Grief","LGBTQ","Mood Disorders","Play Therapy","PTSD-Trauma","Women's Mental Health"],conditions:GBO_C,ia:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military"]},
  {id:18,name:"Ashton Gilbert",credentials:"LCSWA",role:"General Associate Therapist",department:"Greensboro",ages:"10+",location:["Greensboro","Virtual"],expertise:["ADHD","Anxiety","Childhood Behavioral","Grief","Mood Disorders","Play Therapy","PTSD-Trauma","Women's Mental Health"],conditions:GBO_C,ia:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military"]},
  {id:19,name:"Sander Scott",credentials:"LCSW LCAS",role:"Addiction Therapist",department:"Greensboro",ages:"14+",location:["Greensboro","Virtual"],expertise:["ADHD","Anxiety","Grief","LGBTQ","Mood Disorders","PTSD-Trauma","Substance Use","Women's Mental Health"],conditions:GBO_C,ia:["Alliance Health Medicaid","Ambetter","Amerihealth Next","BCBS","Gateway","HealthTeam","Humana","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military"],ii:["Aetna","Cigna","DirectNET","Medcost"]},
  {id:20,name:"Sarah Shine",credentials:"LCSWA",role:"Associate Adult Therapist",department:"Greensboro",ages:"16+",location:["Greensboro","Virtual"],expertise:["ADHD","Anxiety","Grief","LGBTQ","Mood Disorders","PTSD-Trauma","Women's Mental Health"],conditions:GBO_C2,ia:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military"]},
  {id:21,name:"Sarah Smith",credentials:"LCSWA",role:"General Associate Therapist",department:"Greensboro",ages:"6-40",location:["Greensboro","Virtual"],expertise:["ADHD","Anxiety","Eating Disorders","Grief","LGBTQ","Mood Disorders","PTSD-Trauma","Women's Mental Health"],conditions:GBO_C2,ia:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military"]},
  {id:22,name:"Janae Stitt",credentials:"LCMHCA",role:"Adult Associate Therapist",department:"Greensboro",ages:"16+",location:["Greensboro","Virtual"],expertise:["ADHD","Anxiety","Grief","LGBTQ","Mood Disorders","Substance Use","Women's Mental Health"],conditions:GBO_C2,ia:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military"]},
  {id:23,name:"Rayana Swanson",credentials:"LCMHCA",role:"Pediatric Associate Therapist",department:"Greensboro",ages:"6-26",location:["Greensboro","Virtual"],expertise:["ADHD","Anxiety","Autism","Childhood Behavioral","Family and Couples","Grief","Mood Disorders","Play Therapy","PTSD-Trauma"],conditions:PED_C,ia:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military"]},
  {id:24,name:"Brianna Williams",credentials:"LCMHCA",role:"Adult Associate Therapist",department:"Greensboro",ages:"16+",location:["Greensboro","Virtual"],expertise:["Anxiety","Grief","LGBTQ","PTSD-Trauma","Women's Mental Health"],conditions:GBO_C2,ia:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Medicare","Blue Medicare","UBH-UHC-Optum"]},
  {id:25,name:"Jada Williams",credentials:"LCMHC",role:"Pediatric Therapist",department:"Greensboro",ages:"18-40",location:["Greensboro","Virtual"],expertise:["ADHD","Anxiety","Childhood Behavioral","Family and Couples","Grief","LGBTQ","Mood Disorders","Play Therapy","PTSD-Trauma","Women's Mental Health"],conditions:PED_C,ia:["Alliance Health Medicaid","Ambetter","Amerihealth Next","BCBS","Gateway","HealthTeam","Humana","Medicaid","Aetna","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25","Medicare","Blue Medicare","Medcost","UBH-UHC-Optum","TriCare-Humana Military"],ii:["DirectNET"]},
  {id:26,name:"TyZhane Young",credentials:"LCSWA",role:"Pediatric Associate Therapist",department:"Greensboro",ages:"6-26",location:["Greensboro","Virtual"],expertise:["ADHD","Anxiety","Autism","Childhood Behavioral","Family and Couples","Grief","LGBTQ","Mood Disorders","Play Therapy","PTSD-Trauma","Women's Mental Health"],conditions:PED_C,ia:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military"]},
  {id:27,name:"Sarah Clay",credentials:"LCSWA",role:"General Associate Therapist",department:"Hickory",ages:"10+",location:["Hickory","Virtual"],expertise:["ADHD","Anxiety","Autism","Childhood Behavioral","Family and Couples","LGBTQ","Mood Disorders","Movement Therapy","Play Therapy","PTSD-Trauma","Women's Mental Health"],conditions:GBO_C,ia:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military"]},
  {id:28,name:"Melissa Kerekes",credentials:"LCSW",role:"Pediatric Therapist",department:"Hickory",ages:"6-40",location:["Hickory","Virtual"],expertise:["Family and Couples","ADHD","Anxiety","Autism","Childhood Behavioral","LGBTQ","Mood Disorders","Movement Therapy","PTSD-Trauma","Sexual Health","Substance Use","Women's Mental Health"],conditions:PED_C,ia:STD,ii:[]},
  {id:29,name:"Ruby Osorio",credentials:"LCMHCA",role:"General Associate Therapist",department:"Hickory",ages:"10+",location:["Hickory","Virtual"],expertise:["ADHD","Anxiety","Autism","Childhood Behavioral","Eating Disorders","Family and Couples","Grief","LGBTQ","Mood Disorders","Movement Therapy","Play Therapy","PTSD-Trauma","Women's Mental Health"],conditions:GBO_C,ia:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military"]},
  {id:30,name:"Julia Oesterle",credentials:"LCSW",role:"Adult Therapist",department:"Hickory",ages:"16+",location:["Virtual"],expertise:["ADHD","Anxiety","Autism","Grief","Mood Disorders","Women's Mental Health"],conditions:HKY_C2,ia:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military"]},
  {id:31,name:"Ami Silva",credentials:"LCMHC",role:"General Therapist",department:"Hickory",ages:"10+",location:["Hickory","Virtual"],expertise:["ADHD","Anxiety","Autism","Childhood Behavioral","EMDR","Grief","Mood Disorders","PTSD-Trauma","Women's Mental Health"],conditions:GBO_C,ia:STD,ii:[]},
  {id:32,name:"Yer Vang",credentials:"LCMHCA",role:"Adult Associate Therapist",department:"Hickory",ages:"16+",location:["Hickory","Virtual"],expertise:["ADHD","Anxiety","Grief","PTSD-Trauma"],conditions:GBO_C,ia:["Alliance Health Medicaid","Ambetter","BCBS","DirectNET","HealthTeam","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Aetna","Amerihealth Next","Cigna","Gateway","Humana","Medcost","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military"]},
  {id:33,name:"Haley Yost",credentials:"LCMHCA",role:"Adult Associate Therapist",department:"Hickory",ages:"16+",location:["Hickory","Virtual"],expertise:["ADHD","Anxiety","LGBTQ","Mood Disorders","PTSD-Trauma","Substance Use","Women's Mental Health"],conditions:HKY_C2,ia:["Alliance Health Medicaid","Ambetter","BCBS","HealthTeam","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Aetna","Amerihealth Next","Cigna","DirectNET","Gateway","Humana","Medcost","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military"]},
  {id:34,name:"Caitlin Murphy",credentials:"LCMHCA",role:"Adult Associate Therapist",department:"Mt. Airy",ages:"16+",location:["Mount Airy","Virtual"],expertise:["ADHD","Anxiety","Autism","LGBTQ","Mood Disorders","PTSD-Trauma","Women's Mental Health"],conditions:GBO_C2,ia:["Aetna","Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medcost","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Amerihealth Next","Cigna","DirectNET","Humana","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military","Wellcare Medicare"]},
  {id:35,name:"Ashlyn Nelson",credentials:"LCSWA",role:"Adult Associate Therapist",department:"Mt. Airy",ages:"16+",location:["Mount Airy","Virtual"],expertise:["Anxiety","Family and Couples","Grief","Mood Disorders","PTSD-Trauma","Substance Use","Women's Mental Health"],conditions:GBO_C2,ia:["Aetna","Alliance Health Medicaid","Ambetter","BCBS","DirectNET","Gateway","HealthTeam","Medcost","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Amerihealth Next","Cigna","Humana","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military","Wellcare Medicare"]},
  {id:36,name:"Daniel Walker",credentials:"LCMHC LCAS",role:"Adult Addictions Therapist",department:"Asheville",ages:"16+",location:["Virtual"],expertise:["ADHD","Anxiety","Autism","Grief","LGBTQ","Mood Disorders","PTSD-Trauma","Substance Use"],conditions:GBO_C,ia:["Aetna","Alliance Health Medicaid","Ambetter","Amerihealth Next","BCBS","Gateway","Humana","Medcost","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military","Wellcare Medicare"],ii:["Cigna","DirectNET","HealthTeam"]},
  {id:37,name:"Rayanna Abdelaziz",credentials:"LCMHCA",role:"General Associate Therapist",department:"Charlotte",ages:"10-40",location:["Charlotte","Virtual"],expertise:["Family and Couples","Anxiety","Autism","Childhood Behavioral","LGBTQ","Mood Disorders","PTSD-Trauma","Women's Mental Health"],conditions:CLT_C,ia:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medcost","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military"]},
  {id:38,name:"Julee Mae Anderson",credentials:"LCMHCA",role:"Pediatric Associate Therapist",department:"Charlotte",ages:"6-26",location:["Charlotte","Virtual"],expertise:["Anxiety","Autism","Childhood Behavioral","Family and Couples","Play Therapy","Women's Mental Health"],conditions:PED_C,ia:["Alliance Health Medicaid","Ambetter","BCBS","DirectNET","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Aetna","Amerihealth Next","Cigna","Humana","Medcost","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military"]},
  {id:39,name:"Christian Armour",credentials:"LCMHC LCASA",role:"Adult Addiction Therapist",department:"Charlotte",ages:"16+",location:["Charlotte","Virtual"],expertise:["ADHD","Anxiety","Mood Disorders","Substance Use","Women's Mental Health"],conditions:CLT_C,ia:["Alliance Health Medicaid","Ambetter","BCBS","DirectNET","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25","Medicare","TriCare-Humana Military"],ii:["Aetna","Amerihealth Next","Cigna","Humana","Medcost","Blue Medicare","UBH-UHC-Optum"]},
  {id:40,name:"Christi Brannen",credentials:"LCMHC",role:"General Therapist",department:"Charlotte",ages:"10+",location:["Charlotte","Virtual"],expertise:["Anxiety","Chronic Pain","Grief","LGBTQ","Mood Disorders","PTSD-Trauma","Sleep Disorders","Women's Mental Health"],conditions:CLT_C,ia:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Humana","Medcost","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Aetna","Amerihealth Next","Cigna","DirectNET","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military"]},
  {id:41,name:"Austin Kovach",credentials:"LCSWA",role:"Associate Adult Therapist",department:"Charlotte",ages:"16+",location:["Charlotte","Virtual"],expertise:["ADHD","Anxiety","LGBTQ","Mood Disorders","PTSD-Trauma","Substance Use"],conditions:CLT_C2,ia:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military"]},
  {id:42,name:"Jeanevra McMillan",credentials:"LMFT",role:"Adult Therapist",department:"Charlotte",ages:"16+",location:["Charlotte","Virtual"],expertise:["Couples and Family","Anxiety","Grief","Mood Disorders","Women's Mental Health"],conditions:CLT_C2,ia:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Humana","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25","Medicare","Blue Medicare"],ii:["Aetna","Amerihealth Next","Cigna","Medcost","UBH-UHC-Optum","TriCare-Humana Military"]},
  {id:43,name:"Samira Shahedah",credentials:"LCSWA",role:"Associate Adult Therapist",department:"Charlotte",ages:"16+",location:["Charlotte","Virtual"],expertise:["ADHD","Anxiety","Grief","LGBTQ","Mood Disorders","PTSD-Trauma","Women's Mental Health"],conditions:CLT_C2,ia:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military"]},
  {id:44,name:"Kiana Terry",credentials:"LCSWA",role:"General Associate Therapist",department:"Charlotte",ages:"10+",location:["Charlotte","Virtual"],expertise:["Somatic Techniques","ERP for OCD","ADHD","Childhood Behavioral","Family and Couples","LGBTQ","Mood Disorders","PTSD-Trauma","Women's Mental Health"],conditions:CLT_C,ia:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military"]},
  {id:45,name:"Jasmine Peyton",credentials:"LCSWA",role:"General Associate Therapist",department:"Raleigh",ages:"10+",location:["Raleigh","Virtual"],expertise:["Anxiety","Childhood Behavioral","LGBTQ","Play Therapy","Sleep Disorders","Women's Mental Health"],conditions:GBO_C,ia:["Aetna","Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medcost","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Amerihealth Next","Cigna","DirectNET","Humana","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military","Wellcare Medicare"]},
  {id:46,name:"Nekita Beach",credentials:"LCMHC",role:"Adult Therapist",department:"Raleigh",ages:"16+",location:["Raleigh","Virtual"],expertise:["Anxiety","Family and Couples","Grief","Mood Disorders","PTSD-Trauma","Substance Use","Women's Mental Health"],conditions:GBO_C,ia:["Alliance Health Medicaid","Ambetter","Amerihealth Next","BCBS","Gateway","HealthTeam","Humana","Medcost","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military"],ii:["Aetna","Cigna","DirectNET"]},
  {id:47,name:"Taylor Burleson",credentials:"LCMHCA",role:"Adult Associate Therapist",department:"Raleigh",ages:"16+",location:["Raleigh","Virtual"],expertise:["Anxiety","Grief","LGBTQ","Mood Disorders","Movement Therapy","Sexual Health","Women's Mental Health"],conditions:GBO_C,ia:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medcost","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25","Medicare"],ii:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military"]},
  {id:48,name:"Gabriele Duzer",credentials:"LCSWA",role:"Adult Associate Therapist",department:"Raleigh",ages:"16+",location:["Raleigh","Virtual"],expertise:["ADHD","Anxiety","Eating Disorders","LGBTQ","Mood Disorders","PTSD-Trauma","Sexual Health","Women's Mental Health"],conditions:GBO_C,ia:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military"]},
  {id:49,name:"Brooke Smithson",credentials:"LCMHCA",role:"General Associate Therapist",department:"Durham",ages:"10+",location:["Durham","Virtual"],expertise:["ADHD","Anxiety","Grief","Mood Disorders","Play Therapy","PTSD-Trauma","Women's Mental Health"],conditions:GBO_C,ia:["Aetna","Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military","Wellcare Medicare"]},
  {id:50,name:"Emily Spain",credentials:"LCMHCA",role:"General Associate Therapist",department:"Durham",ages:"10+",location:["Durham","Virtual"],expertise:["ADHD","Anxiety","Autism","Eating Disorders","Grief","LGBTQ","Mood Disorders","PTSD-Trauma","Women's Mental Health"],conditions:GBO_C2,ia:["Aetna","Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military","Wellcare Medicare"]},
  {id:51,name:"Tryphene Dugger",credentials:"LCMHCA",role:"Adult Associate Therapist Bilingual French",department:"Durham",ages:"16+",location:["Durham","Virtual"],expertise:["ADHD","Childhood Behavioral","Family and Couples","Grief","Bilingual French"],conditions:GBO_C,ia:["Alliance Health Medicaid","Ambetter","BCBS","DirectNET","Gateway","HealthTeam","Medcost","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Aetna","Amerihealth Next","Cigna","Humana","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military"]},
  {id:52,name:"Termine Hacker",credentials:"LCMHCA",role:"General Associate Therapist",department:"Durham",ages:"10+",location:["Durham","Virtual"],expertise:["ADHD","Anxiety","Autism","Eating Disorders","Grief","LGBTQ","Movement Therapy","Mood Disorders","PTSD-Trauma","Women's Mental Health"],conditions:GBO_C,ia:["Alliance Health Medicaid","Ambetter","BCBS","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Aetna","Amerihealth Next","Cigna","DirectNET","Humana","Medcost","Medicare","Blue Medicare","UBH-UHC-Optum","TriCare-Humana Military"]},
  {id:53,name:"Ana Marques",credentials:"LCMHCA",role:"Associate General Therapist",department:"Durham",ages:"16+",location:["Durham","Virtual"],expertise:["Anxiety","Chronic Pain","Grief","LGBTQ","PTSD-Trauma","Sexual Health","Women's Mental Health"],conditions:GBO_C,ia:["Aetna","Alliance Health Medicaid","Ambetter","BCBS","DirectNET","Gateway","HealthTeam","Medicaid","Amerihealth Caritas","Carolina Complete Medicaid","Healthy Blue","UHC Community Plan","Partners Medicaid","Partners Direct 12-1-25"],ii:["Amerihealth Next","Cigna","Humana","Medcost","Medicare","Blue Medicare","UBH-UHC-Optum"]},
];

const INITIAL_PROVIDERS = RAW_PROVIDERS.map(p => {
  let active = normIns(p.ia);
  let inactive = normIns(p.ii).filter(i => !active.includes(i));
  if (!active.includes("BCBS")) active = [...active, "BCBS"];
  inactive = inactive.filter(i => i !== "BCBS");
  return { ...p, insurance_active: active, insurance_inactive: inactive };
});

const PRIORITY_OPTIONS = ["Priority 1","Priority 2","Paused","Active"];

function buildClinics() {
  const map = {};
  INITIAL_PROVIDERS.forEach(p => {
    if (p.department === "Independent Contract") return;
    if (!map[p.department]) map[p.department] = [];
    map[p.department].push({ name: p.name.split(" ")[0], fullName: p.name, license: p.credentials, priority: 2, status: "active", statusLabel: "Priority 2", notes: "", openings: {} });
  });
  return Object.entries(map).map(([clinic, therapists]) => ({ clinic, therapists }));
}

function getWeekKey(d = new Date()) {
  const x = new Date(d); x.setHours(0,0,0,0); x.setDate(x.getDate()-x.getDay());
  return x.toISOString().split("T")[0];
}
function getLast26Weeks() {
  const w=[], n=new Date();
  for(let i=25;i>=0;i--){const d=new Date(n);d.setDate(d.getDate()-d.getDay()-i*7);w.push(getWeekKey(d));}
  return w;
}
function daysAgo(ts){ try{return Math.floor((Date.now()-new Date(ts).getTime())/86400000);}catch{return 0;} }
function buildDefaultStatuses(){
  const s={};
  departments.forEach(d=>d.divisions.forEach(div=>{s[div.name]=div.drivers.map(()=>"green");}));
  return s;
}
function safeObj(v){ return(v&&typeof v==="object"&&!Array.isArray(v))?v:{}; }
function safeArr(v){ return Array.isArray(v)?v:[]; }

function Gauge({value,target,label,unit,higherIsBetter}){
  const has=value!=null&&value!=="", num=parseFloat(value);
  let pct=0,color="#475569",sl="No Data";
  if(has){
    if(target===0){if(num===0){pct=100;color="#10b981";sl="On Target";}else if(num<=3){pct=60;color="#eab308";sl="Close";}else{pct=20;color="#ef4444";sl="Below";}}
    else if(higherIsBetter){pct=Math.min((num/target)*100,100);color=pct>=100?"#10b981":pct>=85?"#eab308":"#ef4444";sl=pct>=100?"On Target":pct>=85?"Close":"Below";}
  }
  const circ=Math.PI*54, dash=(pct/100)*circ;
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 120 70" className="w-24 h-14">
        <path d="M 10 65 A 54 54 0 0 1 110 65" fill="none" stroke="#1e293b" strokeWidth="10" strokeLinecap="round"/>
        <path d="M 10 65 A 54 54 0 0 1 110 65" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}/>
        <text x="60" y="58" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{has?`${value}${unit}`:"—"}</text>
      </svg>
      <div className="text-center">
        <div className="text-xs text-slate-400 leading-tight px-1">{label}</div>
        <div className="text-xs font-semibold" style={{color}}>{sl}</div>
        <div className="text-xs text-slate-600">Goal: {target===0?"0":`${target}${unit}`}</div>
      </div>
    </div>
  );
}

function TrendChart({history,metricDef,weeks}){
  const W=300,H=90,pad={l:28,r:8,t:8,b:20},iW=W-pad.l-pad.r,iH=H-pad.t-pad.b;
  const h=safeObj(history);
  const vals=weeks.map(w=>{const wd=h[w];return(wd&&typeof wd==="object")?parseFloat(wd[metricDef.key]):null;});
  const def=vals.filter(v=>v!==null&&!isNaN(v));
  if(!def.length) return <div className="text-center text-slate-500 text-xs py-3">No historical data yet</div>;
  const maxV=metricDef.target===0?Math.max(...def,5):Math.max(metricDef.target*1.1,...def);
  const bW=iW/weeks.length,toY=v=>pad.t+iH-((v/maxV))*iH,toX=i=>pad.l+i*bW+bW/2;
  const pts=vals.map((v,i)=>v!==null&&!isNaN(v)?`${toX(i)},${toY(v)}`:null).filter(Boolean);
  const tY=metricDef.target===0?null:toY(metricDef.target);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20">
      {tY&&<line x1={pad.l} y1={tY} x2={W-pad.r} y2={tY} stroke="#10b981" strokeWidth="1" strokeDasharray="3 2" opacity="0.5"/>}
      {vals.map((v,i)=>{
        if(v===null||isNaN(v)) return null;
        const c=metricDef.target===0?(v===0?"#10b981":v<=3?"#eab308":"#ef4444"):(v>=metricDef.target?"#10b981":v>=metricDef.target*0.85?"#eab308":"#ef4444");
        return <rect key={i} x={pad.l+i*bW+bW*0.15} y={toY(v)} width={bW*0.7} height={(v/maxV)*iH} fill={c} opacity="0.7" rx="1"/>;
      })}
      {pts.length>1&&<polyline points={pts.join(" ")} fill="none" stroke="white" strokeWidth="1.5" opacity="0.7" strokeLinecap="round" strokeLinejoin="round"/>}
      {weeks.map((w,i)=>i%6===0?<text key={i} x={toX(i)} y={H-4} textAnchor="middle" fill="#64748b" fontSize="7">{w.slice(5)}</text>:null)}
    </svg>
  );
}

function HealthCircle({pct}){
  const r=54,circ=2*Math.PI*r,dash=(pct/100)*circ,color=pct>=80?"#10b981":pct>=60?"#eab308":"#ef4444",lbl=pct>=80?"Excellent":pct>=60?"Good":"At Risk";
  return (
    <svg viewBox="0 0 130 130" className="w-36 h-36">
      <circle cx="65" cy="65" r={r} fill="none" stroke="#1e293b" strokeWidth="12"/>
      <circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="12" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 65 65)"/>
      <text x="65" y="60" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">{pct}%</text>
      <text x="65" y="78" textAnchor="middle" fill="#94a3b8" fontSize="11">{lbl}</text>
    </svg>
  );
}

function MetricsSection({division,metricsHistory,assignedTo,currentUser,isAdmin,onEnterMetrics}){
  const [showHist,setShowHist]=useState(false);
  const divMetrics=DIVISION_METRICS[division]||[];
  const weeks=getLast26Weeks();
  const cw=getWeekKey();
  const dh=safeObj(metricsHistory);
  const cur=safeObj(dh[cw]);
  const hasData=divMetrics.some(dm=>cur[dm.key]!=null&&cur[dm.key]!=="");
  const assignedTo2=assignedTo||"";
  const canEdit=isAdmin||(assignedTo2!==""&&currentUser===assignedTo2)||assignedTo2==="";
  return (
    <div className="mb-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Weekly Metrics</span>
          {assignedTo&&<span className="text-xs text-slate-500">· {assignedTo}</span>}
          {canEdit&&!hasData&&<span className="text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-1.5 py-0.5 rounded font-semibold animate-pulse">Entry Needed</span>}
        </div>
        <div className="flex items-center gap-2">
          {canEdit&&<button onClick={()=>onEnterMetrics(division)} className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded">{hasData?"Update":"Enter"}</button>}
          <button onClick={()=>setShowHist(h=>!h)} className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1">
            Trend{showHist?<ChevronUp className="w-3 h-3"/>:<ChevronDown className="w-3 h-3"/>}
          </button>
        </div>
      </div>
      <div className="p-3">
        {!hasData
          ? <div className="text-center py-2 text-slate-500 text-xs">{canEdit?"Click Enter to add this week's metrics":"Waiting for metrics"}</div>
          : <div className={`grid gap-2 ${divMetrics.length===1?"grid-cols-1 max-w-[100px] mx-auto":divMetrics.length===2?"grid-cols-2":"grid-cols-3"}`}>
              {divMetrics.map(dm=><Gauge key={dm.key} value={cur[dm.key]} target={dm.target} label={dm.label} unit={dm.unit} higherIsBetter={dm.higherIsBetter}/>)}
            </div>
        }
      </div>
      {showHist&&(
        <div className="border-t border-slate-700/50 p-3 space-y-3">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Last 6 Months</p>
          {divMetrics.map(dm=>(
            <div key={dm.key}>
              <p className="text-xs text-slate-400 mb-1">{dm.label}</p>
              <TrendChart history={dh} metricDef={dm} weeks={weeks}/>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MetricsModal({division,history,onSave,onClose}){
  const divMetrics=DIVISION_METRICS[division]||[];
  const wk=getWeekKey();
  const existing=safeObj(safeObj(history)[wk]);
  const [form,setForm]=useState(()=>{const f={};divMetrics.forEach(dm=>{f[dm.key]=existing[dm.key]||"";});return f;});
  return (
    <div style={{position:"fixed",inset:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.7)"}} onClick={onClose}>
      <div style={{background:"#0f172a",border:"1px solid #334155",borderRadius:"1rem",padding:"1.5rem",width:"100%",maxWidth:"24rem"}} onClick={e=>e.stopPropagation()}>
        <h2 style={{color:"white",fontWeight:"bold",fontSize:"1.1rem",marginBottom:"0.25rem"}}>Enter Weekly Metrics</h2>
        <p style={{color:"#34d399",fontSize:"0.875rem",fontWeight:"600",marginBottom:"1rem"}}>{division} — Week of {wk}</p>
        <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
          {divMetrics.map(dm=>(
            <div key={dm.key}>
              <label style={{display:"block",color:"#94a3b8",fontSize:"0.75rem",fontWeight:"600",marginBottom:"0.25rem"}}>{dm.label}</label>
              <input type="number" value={form[dm.key]} onChange={e=>setForm(f=>({...f,[dm.key]:e.target.value}))} placeholder="Enter value" style={{width:"100%",background:"#1e293b",border:"1px solid #334155",color:"white",borderRadius:"0.5rem",padding:"0.5rem 0.75rem",fontSize:"0.875rem",outline:"none",boxSizing:"border-box"}}/>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:"0.75rem",marginTop:"1.25rem"}}>
          <button onClick={()=>onSave(division,wk,form)} style={{flex:1,background:"#059669",color:"white",fontWeight:"bold",padding:"0.625rem",borderRadius:"0.5rem",border:"none",cursor:"pointer"}}>Save</button>
          <button onClick={onClose} style={{flex:1,background:"#334155",color:"#cbd5e1",fontWeight:"bold",padding:"0.625rem",borderRadius:"0.5rem",border:"none",cursor:"pointer"}}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function DriverCard({driver,idx,divisionName,status,comments,pinnedDrivers,onToggle,onAddComment,onTogglePin}){
  const [expanded,setExpanded]=useState(false);
  const [editing,setEditing]=useState(false);
  const [txt,setTxt]=useState("");
  const [selUser,setSelUser]=useState(TEAM_MEMBERS[0]);
  const [selStatus,setSelStatus]=useState("pending");
  const sc=safeArr(comments);
  const isPinned=pinnedDrivers.includes(`${divisionName}-${idx}`);
  const isMain=idx===0;
  const pending=sc.filter(c=>c&&c.status==="pending").length;
  const last=sc.length?sc.reduce((a,b)=>new Date(a.timestamp)>new Date(b.timestamp)?a:b):null;
  const members=[...new Set(sc.map(c=>c.author).filter(Boolean))];
  const save=()=>{
    if(!txt.trim()) return;
    onAddComment(divisionName,idx,{text:txt.trim(),author:selUser,status:selStatus,timestamp:new Date().toISOString()});
    setTxt(""); setEditing(false);
  };
  return (
    <div className={`rounded-lg border transition-all ${status==="green"?"border-emerald-700/40 bg-emerald-950/20":"border-red-700/40 bg-red-950/20"} ${isPinned?"ring-2 ring-yellow-500/50":""}`}>
      <div className="flex items-start gap-2 p-3 cursor-pointer" onClick={()=>setExpanded(e=>!e)}>
        <button onClick={e=>{e.stopPropagation();onToggle();}} className={`mt-0.5 w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center hover:scale-110 transition-all ${status==="green"?"border-emerald-500 bg-emerald-500/20":"border-red-500 bg-red-500/20"}`}>
          <div className={`w-2.5 h-2.5 rounded-full ${status==="green"?"bg-emerald-400":"bg-red-400"}`}/>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isMain?"bg-slate-600 text-slate-200":"bg-slate-800 text-slate-400"}`}>{isMain?"MAIN":`P${idx+1}`}</span>
            {pending>0&&<span className="text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-1.5 py-0.5 rounded font-semibold">{pending} pending</span>}
            {sc.length>0&&<span className="text-xs text-slate-400 flex items-center gap-1"><MessageSquare className="w-3 h-3"/>{sc.length}</span>}
            {last&&<span className="text-xs text-slate-500">{daysAgo(last.timestamp)}d ago</span>}
            {members.length>0&&<span className="text-xs text-slate-400">{members.join(", ")}</span>}
          </div>
          <p className="text-sm text-slate-200 leading-snug">{driver}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={e=>{e.stopPropagation();onTogglePin();}} className={`p-1 rounded ${isPinned?"bg-yellow-500/30 text-yellow-300":"bg-slate-700 text-slate-500 hover:text-slate-300"}`}><Pin className="w-3 h-3"/></button>
          <button onClick={e=>{e.stopPropagation();setExpanded(true);setEditing(true);}} className="p-1 rounded bg-slate-700 text-slate-400"><MessageSquare className="w-3 h-3"/></button>
          {expanded?<ChevronUp className="w-3.5 h-3.5 text-slate-500"/>:<ChevronDown className="w-3.5 h-3.5 text-slate-500"/>}
        </div>
      </div>
      {expanded&&(
        <div className="border-t border-slate-800 px-3 py-2 space-y-2">
          {sc.map((c,ci)=>(
            <div key={ci} className={`border-l-4 pl-3 py-1.5 rounded-r text-xs ${c.status==="pending"?"border-yellow-500 bg-yellow-900/20":"border-blue-500 bg-blue-900/20"}`}>
              <div className="flex justify-between gap-2">
                <div className="flex-1">
                  <span className="font-bold text-white mr-2">{c.author}</span>
                  <span className={`px-1.5 py-0.5 rounded border font-semibold ${c.status==="pending"?"bg-yellow-500/20 text-yellow-300 border-yellow-500/50":"bg-blue-500/20 text-blue-300 border-blue-500/50"}`}>{c.status==="pending"?"PENDING":"COMPLETE"}</span>
                  <span className="text-slate-500 ml-2">{daysAgo(c.timestamp)}d ago</span>
                  <p className="text-slate-300 mt-1">{c.text}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={()=>onAddComment(divisionName,idx,null,ci)} className="p-1 rounded bg-slate-700 text-slate-300"><Check className="w-3 h-3"/></button>
                  <button onClick={()=>onAddComment(divisionName,idx,null,ci,true)} className="p-1 rounded bg-red-900/40 text-red-400"><X className="w-3 h-3"/></button>
                </div>
              </div>
            </div>
          ))}
          {editing?(
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-2 space-y-2">
              <div className="flex gap-2">
                <select value={selUser} onChange={e=>setSelUser(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 rounded p-1 text-xs">
                  {TEAM_MEMBERS.map(m=><option key={m}>{m}</option>)}
                </select>
                <select value={selStatus} onChange={e=>setSelStatus(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 rounded p-1 text-xs">
                  <option value="pending">Pending</option>
                  <option value="complete">Complete</option>
                </select>
              </div>
              <textarea value={txt} onChange={e=>setTxt(e.target.value)} placeholder="Add a comment..." autoFocus className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded p-1.5 text-xs min-h-[50px] placeholder-slate-600"/>
              <div className="flex gap-2">
                <button onClick={save} className="px-2 py-1 bg-emerald-600 text-white text-xs font-bold rounded">Save</button>
                <button onClick={()=>setEditing(false)} className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">Cancel</button>
              </div>
            </div>
          ):(
            <button onClick={()=>setEditing(true)} className="text-xs text-emerald-400 font-semibold flex items-center gap-1"><Plus className="w-3 h-3"/> Add Comment</button>
          )}
        </div>
      )}
    </div>
  );
}

function DivisionPanel({division,statuses,comments,pinnedDrivers,onToggle,onAddComment,onTogglePin,metricsHistory,assignments,currentUser,isAdmin,onEnterMetrics,meetingMode,filters}){
  const drivers=division.drivers;
  const ss=safeArr(statuses).length===drivers.length?safeArr(statuses):drivers.map(()=>"green");
  const green=drivers.filter((_,i)=>ss[i]==="green").length;
  const pct=Math.round((green/drivers.length)*100);
  const visible=drivers.filter((_,i)=>{
    const s=ss[i], c=safeArr(comments[i]);
    if(meetingMode) return s==="red"||c.some(x=>x&&x.status==="pending");
    if(filters&&filters.status==="red") return s==="red";
    if(filters&&filters.status==="green") return s==="green";
    return true;
  });
  const pinned=visible.filter(d=>pinnedDrivers.includes(`${division.name}-${drivers.indexOf(d)}`));
  const sorted=[...pinned,...visible.filter(d=>!pinned.includes(d))];
  const dh=safeObj(safeObj(metricsHistory)[division.name]);
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
        <h3 className="text-base font-bold text-white">{division.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{pct}%</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${pct===100?"bg-emerald-500/20 text-emerald-300":pct>=60?"bg-yellow-500/20 text-yellow-300":"bg-red-500/20 text-red-300"}`}>{green}/{drivers.length}</span>
        </div>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full mb-3 overflow-hidden">
        <div className="h-full rounded-full" style={{width:`${pct}%`,background:pct===100?"#10b981":pct>=60?"#eab308":"#ef4444"}}/>
      </div>
      {DIVISION_METRICS[division.name]&&<MetricsSection division={division.name} metricsHistory={dh} assignedTo={assignments[division.name]} currentUser={currentUser} isAdmin={isAdmin} onEnterMetrics={onEnterMetrics}/>}
      <div className="space-y-2">
        {sorted.length===0
          ? <p className="text-slate-500 text-sm text-center py-3">No drivers match filter</p>
          : sorted.map(driver=>{
              const ri=drivers.indexOf(driver);
              return <DriverCard key={ri} driver={driver} idx={ri} divisionName={division.name} status={ss[ri]||"green"} comments={safeArr(comments[ri])} pinnedDrivers={pinnedDrivers} onToggle={()=>onToggle(division.name,ri)} onAddComment={onAddComment} onTogglePin={()=>onTogglePin(`${division.name}-${ri}`)}/>;
            })
        }
      </div>
    </div>
  );
}

function ProviderCard({p}){
  const [exp,setExp]=useState(false);
  const c=DEPT_COLORS[p.department]||"#888";
  const ini=p.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  return (
    <div style={{background:"#27272a",border:"1px solid #3f3f46",borderRadius:12,overflow:"hidden",marginBottom:8}}>
      <div style={{padding:"14px 16px",display:"flex",gap:12,alignItems:"flex-start"}}>
        <div style={{width:40,height:40,borderRadius:"50%",background:c+"33",border:"2px solid "+c+"66",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:500,fontSize:12,color:c,flexShrink:0}}>{ini}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:6,marginBottom:4}}>
            <span style={{fontWeight:500,fontSize:14,color:"#f4f4f5"}}>{p.name}, {p.credentials}</span>
            <span style={{padding:"2px 8px",borderRadius:999,fontSize:11,fontWeight:500,background:c+"22",color:c,border:"1px solid "+c+"55"}}>{p.department}</span>
          </div>
          <div style={{fontSize:11,color:"#71717a",marginBottom:6}}>{p.role} · Ages {p.ages} · {p.location.join(", ")}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:3}}>{p.expertise.map(e=><span key={e} style={{fontSize:10,padding:"2px 6px",borderRadius:5,background:"#3f3f46",color:"#a1a1aa",border:"1px solid #52525b"}}>{e}</span>)}</div>
        </div>
        <button onClick={()=>setExp(x=>!x)} style={{fontSize:11,padding:"4px 10px",border:"1px solid #52525b",borderRadius:7,background:exp?"#3f3f46":"transparent",color:exp?"#f4f4f5":"#a1a1aa",cursor:"pointer",flexShrink:0}}>{exp?"Hide":"Details"}</button>
      </div>
      {exp&&(
        <div style={{borderTop:"1px solid #3f3f46",padding:"14px 16px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div>
            <div style={{fontSize:10,fontWeight:500,color:"#71717a",marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Conditions</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:3}}>{p.conditions.map(x=><span key={x} style={{fontSize:10,padding:"2px 6px",borderRadius:5,background:"#052e16",color:"#4ade80",border:"1px solid #166534"}}>{x}</span>)}</div>
          </div>
          <div>
            <div style={{fontSize:10,fontWeight:500,color:"#71717a",marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Insurance</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
              {p.insurance_active.map(x=><span key={x} style={{fontSize:10,padding:"2px 6px",borderRadius:5,background:"#052e16",color:"#4ade80",border:"1px solid #166534"}}>{x}</span>)}
              {p.insurance_inactive.map(x=><span key={x} style={{fontSize:10,padding:"2px 6px",borderRadius:5,background:"#1c1917",color:"#78716c",border:"1px solid #44403c",textDecoration:"line-through"}}>{x}</span>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProviderDirectory({canEdit}){
  const [providers,setProviders]=useState(INITIAL_PROVIDERS);
  const [dept,setDept]=useState("All");
  const [search,setSearch]=useState("");
  const [filterIns,setFilterIns]=useState("");
  const [filterAge,setFilterAge]=useState("");
  const [showAdd,setShowAdd]=useState(false);
  const [newP,setNewP]=useState({name:"",credentials:"",role:"",department:"Greenville",ages:"",location:[],expertise:[],conditions:[],insurance_active:[],insurance_inactive:[]});
  const [tags,setTags]=useState({location:"",expertise:"",conditions:"",insurance_active:"",insurance_inactive:""});
  const allIns=useMemo(()=>[...new Set(providers.flatMap(p=>p.insurance_active))].sort(),[providers]);
  const filtered=useMemo(()=>providers.filter(p=>{
    if(dept!=="All"&&p.department!==dept) return false;
    if(filterIns&&!p.insurance_active.includes(filterIns)) return false;
    if(filterAge){const age=parseInt(filterAge),min=parseInt(p.ages.match(/^(\d+)/)?.[1]||"0"),max=parseInt(p.ages.match(/-(\d+)/)?.[1]||"999");if(age<min||age>max)return false;}
    if(search){const s=search.toLowerCase();return p.name.toLowerCase().includes(s)||p.expertise.some(e=>e.toLowerCase().includes(s))||p.conditions.some(x=>x.toLowerCase().includes(s))||p.department.toLowerCase().includes(s)||p.location.some(l=>l.toLowerCase().includes(s));}
    return true;
  }),[providers,dept,search,filterIns,filterAge]);
  const dc=useMemo(()=>{const m={};PROVIDER_DEPTS.forEach(d=>{m[d]=d==="All"?providers.length:providers.filter(p=>p.department===d).length;});return m;},[providers]);
  const addTag=(field)=>{const v=tags[field].trim();if(v&&!newP[field].includes(v)){setNewP(p=>({...p,[field]:[...p[field],v]}));setTags(t=>({...t,[field]:""}));}};
  const saveProvider=()=>{if(!newP.name.trim()||!newP.credentials.trim()) return;setProviders(prev=>[...prev,{...newP,id:Date.now()}]);setShowAdd(false);setNewP({name:"",credentials:"",role:"",department:"Greenville",ages:"",location:[],expertise:[],conditions:[],insurance_active:[],insurance_inactive:[]});};
  return (
    <div style={{background:"#18181b",minHeight:"100%",paddingBottom:40}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:8,marginBottom:16}}>
        {[["Total",providers.length],["Departments",PROVIDER_DEPTS.filter(d=>d!=="All"&&(dc[d]||0)>0).length],["Insurance",allIns.length],["Locations",[...new Set(providers.flatMap(p=>p.location))].length]].map(([l,v])=>(
          <div key={l} style={{background:"#27272a",border:"1px solid #3f3f46",borderRadius:9,padding:"12px 14px"}}>
            <div style={{fontSize:10,color:"#71717a",marginBottom:4,textTransform:"uppercase"}}>{l}</div>
            <div style={{fontSize:22,fontWeight:500,color:"#f4f4f5"}}>{v}</div>
          </div>
        ))}
      </div>
      {canEdit&&<div style={{marginBottom:14,display:"flex",justifyContent:"flex-end"}}><button onClick={()=>setShowAdd(v=>!v)} style={{padding:"7px 16px",fontSize:12,border:"1px solid #16a34a",borderRadius:8,background:"#14532d",cursor:"pointer",fontWeight:500,color:"#4ade80"}}>{showAdd?"Cancel":"+ Add Provider"}</button></div>}
      {showAdd&&(
        <div style={{background:"#27272a",border:"1px solid #3f3f46",borderRadius:12,padding:20,marginBottom:16}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            {[["Full name","name"],["Credentials","credentials"],["Role","role"],["Age range","ages"]].map(([lbl,k])=>(
              <div key={k}><label style={{fontSize:11,color:"#71717a",display:"block",marginBottom:4,textTransform:"uppercase"}}>{lbl}</label><input value={newP[k]} onChange={e=>setNewP(p=>({...p,[k]:e.target.value}))} style={{width:"100%",fontSize:12,padding:"7px 10px",border:"1px solid #52525b",borderRadius:7,background:"#3f3f46",color:"#f4f4f5",boxSizing:"border-box",outline:"none"}}/></div>
            ))}
          </div>
          <div style={{marginBottom:10}}><label style={{fontSize:11,color:"#71717a",display:"block",marginBottom:4,textTransform:"uppercase"}}>Department</label><select value={newP.department} onChange={e=>setNewP(p=>({...p,department:e.target.value}))} style={{width:"100%",fontSize:12,padding:"7px 10px",border:"1px solid #52525b",borderRadius:7,background:"#3f3f46",color:"#f4f4f5",outline:"none"}}>{PROVIDER_DEPTS.filter(d=>d!=="All").map(d=><option key={d}>{d}</option>)}</select></div>
          {["location","expertise","conditions","insurance_active","insurance_inactive"].map(field=>(
            <div key={field} style={{marginBottom:10}}>
              <label style={{fontSize:11,color:"#71717a",display:"block",marginBottom:4,textTransform:"uppercase"}}>{field.replace("_"," ")}</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6}}>{newP[field].map(v=><span key={v} style={{fontSize:11,padding:"2px 8px",borderRadius:6,background:"#3f3f46",border:"1px solid #52525b",display:"flex",alignItems:"center",gap:4,color:"#f4f4f5"}}>{v}<span onClick={()=>setNewP(p=>({...p,[field]:p[field].filter(x=>x!==v)}))} style={{cursor:"pointer",color:"#71717a",fontSize:14}}>x</span></span>)}</div>
              <div style={{display:"flex",gap:6}}><input value={tags[field]} onChange={e=>setTags(t=>({...t,[field]:e.target.value}))} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addTag(field);}}} placeholder={"Add..."} style={{flex:1,fontSize:12,padding:"6px 10px",border:"1px solid #52525b",borderRadius:7,background:"#3f3f46",color:"#f4f4f5",outline:"none"}}/><button onClick={()=>addTag(field)} style={{fontSize:12,padding:"6px 12px",border:"1px solid #52525b",borderRadius:7,background:"#3f3f46",cursor:"pointer",color:"#f4f4f5"}}>Add</button></div>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:12}}>
            <button onClick={()=>setShowAdd(false)} style={{padding:"7px 16px",fontSize:12,border:"1px solid #52525b",borderRadius:7,background:"transparent",cursor:"pointer",color:"#a1a1aa"}}>Cancel</button>
            <button onClick={saveProvider} style={{padding:"7px 16px",fontSize:12,border:"1px solid #16a34a",borderRadius:7,background:"#14532d",cursor:"pointer",fontWeight:500,color:"#4ade80"}}>Save Provider</button>
          </div>
        </div>
      )}
      <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:14}}>
        {PROVIDER_DEPTS.filter(d=>d==="All"||(dc[d]||0)>0).map(d=>{
          const act=dept===d, clr=DEPT_COLORS[d]||"#888";
          return <button key={d} onClick={()=>setDept(d)} style={{padding:"5px 12px",fontSize:12,borderRadius:8,cursor:"pointer",border:act?"1.5px solid "+clr:"1px solid #3f3f46",background:act?clr+"22":"transparent",color:act?clr:"#a1a1aa"}}>{d} <span style={{fontSize:10,padding:"1px 5px",borderRadius:999,background:act?clr+"33":"#3f3f46",color:act?clr:"#71717a"}}>{dc[d]||0}</span></button>;
        })}
      </div>
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, expertise, condition..." style={{flex:2,minWidth:160,fontSize:12,padding:"8px 10px",border:"1px solid #3f3f46",borderRadius:8,background:"#27272a",color:"#f4f4f5",outline:"none"}}/>
        <select value={filterIns} onChange={e=>setFilterIns(e.target.value)} style={{flex:1,minWidth:160,fontSize:12,padding:"8px 10px",border:"1px solid "+(filterIns?"#16a34a":"#3f3f46"),borderRadius:8,background:filterIns?"#14532d":"#27272a",color:filterIns?"#4ade80":"#f4f4f5",outline:"none"}}><option value="">All insurance</option>{allIns.map(i=><option key={i}>{i}</option>)}</select>
        <input value={filterAge} onChange={e=>setFilterAge(e.target.value.replace(/\D/g,""))} placeholder="Age..." style={{width:80,fontSize:12,padding:"8px 10px",border:"1px solid "+(filterAge?"#16a34a":"#3f3f46"),borderRadius:8,background:filterAge?"#14532d":"#27272a",color:filterAge?"#4ade80":"#f4f4f5",outline:"none"}}/>
        {(search||filterIns||filterAge)&&<button onClick={()=>{setSearch("");setFilterIns("");setFilterAge("");}} style={{fontSize:12,padding:"8px 12px",border:"1px solid #7f1d1d",borderRadius:8,background:"transparent",cursor:"pointer",color:"#f87171"}}>Clear</button>}
      </div>
      <div style={{fontSize:11,color:"#71717a",marginBottom:12}}>Showing {filtered.length} of {providers.length} providers{dept!=="All"?" in "+dept:""}</div>
      {filtered.length===0?<div style={{textAlign:"center",padding:"3rem 0",color:"#71717a"}}>No providers found.</div>:filtered.map(p=><ProviderCard key={p.id} p={p}/>)}
    </div>
  );
}

function TherapyOpenings(){
  const [clinics,setClinics]=useState(()=>buildClinics());
  const [weekOf,setWeekOf]=useState(()=>{const d=new Date();d.setDate(d.getDate()-d.getDay());return d.toISOString().split("T")[0];});
  const [lastUpd,setLastUpd]=useState(null);
  const total=clinics.reduce((s,c)=>s+c.therapists.reduce((a,t)=>a+Object.values(t.openings||{}).reduce((x,v)=>x+(parseInt(v)||0),0),0),0);
  const upOpening=(ci,ti,day,val)=>{setClinics(p=>p.map((c,i)=>i!==ci?c:{...c,therapists:c.therapists.map((t,j)=>j!==ti?t:{...t,openings:{...t.openings,[day]:val}})}));setLastUpd(new Date().toLocaleString());};
  const upStatus=(ci,ti,val)=>{setClinics(p=>p.map((c,i)=>i!==ci?c:{...c,therapists:c.therapists.map((t,j)=>j!==ti?t:{...t,status:val==="Paused"?"paused":"active",priority:val==="Priority 1"?1:val==="Priority 2"?2:t.priority,statusLabel:val})}));setLastUpd(new Date().toLocaleString());};
  const upNotes=(ci,ti,val)=>setClinics(p=>p.map((c,i)=>i!==ci?c:{...c,therapists:c.therapists.map((t,j)=>j!==ti?t:{...t,notes:val})}));
  const days=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d,i)=>{const dt=new Date(weekOf);dt.setDate(dt.getDate()+i);return{label:d,date:(dt.getMonth()+1)+"/"+dt.getDate()};});
  const pc=t=>t.status==="paused"?{bg:"#1e293b",text:"#94a3b8"}:t.priority===1?{bg:"#14532d",text:"#4ade80"}:{bg:"#713f12",text:"#fbbf24"};
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><h2 className="text-xl font-bold text-white">Therapy Openings Tracker</h2>{lastUpd&&<p className="text-xs text-slate-500 mt-1">Last updated {lastUpd}</p>}</div>
          <div className="flex items-center gap-4">
            <div><label className="text-xs text-slate-400 block mb-1">Week of</label><input type="date" value={weekOf} onChange={e=>setWeekOf(e.target.value)} className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none"/></div>
            <div className="text-center bg-emerald-500/10 border border-emerald-700/30 rounded-xl px-5 py-3"><div className="text-3xl font-bold text-emerald-400">{total}</div><div className="text-xs text-slate-400">Est. Openings</div></div>
          </div>
        </div>
      </div>
      {clinics.map((clinic,ci)=>{
        const ct=clinic.therapists.reduce((s,t)=>s+Object.values(t.openings||{}).reduce((a,v)=>a+(parseInt(v)||0),0),0);
        return (
          <div key={ci} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 bg-slate-800/50 flex items-center justify-between">
              <h3 className="font-bold text-white">{clinic.clinic}</h3>
              {ct>0&&<span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-semibold">{ct} openings</span>}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-slate-800">
                  <th className="text-left px-4 py-2 text-slate-400 font-semibold w-32">Therapist</th>
                  <th className="text-left px-3 py-2 text-slate-400 font-semibold w-24">License</th>
                  <th className="text-left px-3 py-2 text-slate-400 font-semibold w-32">Status</th>
                  <th className="text-left px-3 py-2 text-slate-400 font-semibold w-32">Notes</th>
                  {days.map(d=><th key={d.label} className="text-center px-2 py-2 text-slate-400 font-semibold w-12"><div>{d.label}</div><div className="text-slate-600 font-normal">{d.date}</div></th>)}
                </tr></thead>
                <tbody>
                  {clinic.therapists.map((t,ti)=>{
                    const p=pc(t);
                    return (
                      <tr key={ti} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                        <td className="px-4 py-2 text-white font-medium">{t.name}</td>
                        <td className="px-3 py-2 text-slate-300">{t.license}</td>
                        <td className="px-3 py-2"><select value={t.statusLabel||"Priority 2"} onChange={e=>upStatus(ci,ti,e.target.value)} className="text-xs font-semibold px-2 py-1 rounded border-0 focus:outline-none cursor-pointer w-full" style={{background:p.bg,color:p.text}}>{PRIORITY_OPTIONS.map(o=><option key={o} value={o} style={{background:"#1e293b",color:"white"}}>{o}</option>)}</select></td>
                        <td className="px-3 py-2"><input type="text" value={t.notes||""} onChange={e=>upNotes(ci,ti,e.target.value)} placeholder="Notes..." className="w-full bg-transparent border-b border-slate-700 text-slate-300 text-xs py-0.5 focus:outline-none focus:border-emerald-500 placeholder-slate-600"/></td>
                        {days.map(d=><td key={d.label} className="px-2 py-1 text-center">{t.status==="paused"?<span className="text-slate-700">-</span>:<input type="number" min="0" max="99" value={t.openings?.[d.label]||""} onChange={e=>upOpening(ci,ti,d.label,e.target.value)} className="w-10 text-center bg-slate-800 border border-slate-700 text-white rounded text-xs py-1 focus:outline-none" placeholder="0"/>}</td>)}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FTEPage({positions,isAdmin,onAdd,onRemove,onUpdate}){
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({title:"",reportsTo:"Jessica",department:"Ops",notes:"",status:"Open"});
  const [err,setErr]=useState("");
  const pos=safeArr(positions);
  const save=()=>{if(!form.title.trim()){setErr("Title required.");return;}onAdd({...form,id:Date.now()});setForm({title:"",reportsTo:"Jessica",department:"Ops",notes:"",status:"Open"});setShowAdd(false);setErr("");};
  const sc=s=>s==="Open"?"bg-emerald-500/20 text-emerald-300 border-emerald-500/40":s==="In Progress"?"bg-yellow-500/20 text-yellow-300 border-yellow-500/40":"bg-slate-500/20 text-slate-300 border-slate-500/40";
  const grouped=ALL_DEPARTMENTS.map(dept=>({dept,mgr:MANAGERS.find(m=>m.departments.includes(dept))?.name||"",items:pos.filter(p=>p.department===dept)})).filter(g=>g.items.length>0);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[{label:"Total",value:pos.length,color:"text-white",bg:"bg-slate-800/50 border-slate-700"},{label:"Open",value:pos.filter(p=>p.status==="Open").length,color:"text-emerald-400",bg:"bg-emerald-500/10 border-emerald-700/30"},{label:"In Progress",value:pos.filter(p=>p.status==="In Progress").length,color:"text-yellow-400",bg:"bg-yellow-500/10 border-yellow-700/30"},{label:"Depts Hiring",value:[...new Set(pos.map(p=>p.department))].length,color:"text-blue-400",bg:"bg-blue-500/10 border-blue-700/30"}].map(s=>(
          <div key={s.label} className={`${s.bg} rounded-xl border p-4 text-center`}><div className={`text-3xl font-bold ${s.color}`}>{s.value}</div><div className="text-xs text-slate-400 mt-1">{s.label}</div></div>
        ))}
      </div>
      {isAdmin&&<div className="flex justify-end"><button onClick={()=>setShowAdd(v=>!v)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg">{showAdd?"Cancel":"+ Post Open Position"}</button></div>}
      {showAdd&&(
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-5 space-y-4">
          <h3 className="text-white font-bold">New Open Position</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><label className="text-xs text-slate-400 block mb-1 uppercase">Position Title *</label><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" placeholder="e.g. Intake Specialist"/></div>
            <div><label className="text-xs text-slate-400 block mb-1 uppercase">Reports To</label><select value={form.reportsTo} onChange={e=>setForm(f=>({...f,reportsTo:e.target.value}))} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none">{MANAGERS.map(m=><option key={m.name} value={m.name}>{m.name}</option>)}</select></div>
            <div><label className="text-xs text-slate-400 block mb-1 uppercase">Department</label><select value={form.department} onChange={e=>setForm(f=>({...f,department:e.target.value}))} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none">{ALL_DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}</select></div>
            <div><label className="text-xs text-slate-400 block mb-1 uppercase">Status</label><select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none"><option>Open</option><option>In Progress</option><option>On Hold</option></select></div>
            <div className="sm:col-span-2"><label className="text-xs text-slate-400 block mb-1 uppercase">Notes</label><textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} rows={2} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none placeholder-slate-600" placeholder="Details, requirements, timeline..."/></div>
          </div>
          {err&&<p className="text-red-400 text-xs">{err}</p>}
          <div className="flex gap-2 justify-end">
            <button onClick={()=>{setShowAdd(false);setErr("");}} className="px-3 py-1.5 text-sm border border-slate-700 rounded-lg text-slate-400">Cancel</button>
            <button onClick={save} className="px-3 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg">Post Position</button>
          </div>
        </div>
      )}
      {pos.length===0&&<div className="bg-slate-900 rounded-xl border border-slate-800 p-12 text-center"><p className="text-slate-400 text-sm">No open positions yet.</p></div>}
      {grouped.map(g=>(
        <div key={g.dept} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-800 bg-slate-800/50 flex items-center justify-between">
            <div><span className="font-bold text-white">{g.dept}</span><span className="text-slate-500 text-xs ml-2">Reports to {g.mgr}</span></div>
            <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{g.items.length} position{g.items.length!==1?"s":""}</span>
          </div>
          <div className="divide-y divide-slate-800">
            {g.items.map(p=>(
              <div key={p.id} className="px-5 py-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-white font-semibold text-sm">{p.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${sc(p.status)}`}>{p.status}</span>
                  </div>
                  <div className="text-xs text-slate-400">Reports to <span className="text-slate-300 font-medium">{p.reportsTo}</span></div>
                  {p.notes&&<p className="text-xs text-slate-500 mt-1">{p.notes}</p>}
                </div>
                {isAdmin&&(
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select value={p.status} onChange={e=>onUpdate(p.id,{...p,status:e.target.value})} className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs focus:outline-none"><option>Open</option><option>In Progress</option><option>On Hold</option></select>
                    <button onClick={()=>onRemove(p.id)} className="text-slate-600 hover:text-red-400 text-sm px-1">x</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminPanel({assignments,onAssign}){
  const divs=departments.flatMap(d=>d.divisions.map(div=>div.name));
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
      <h2 className="text-lg font-bold text-white mb-2">Division Assignments</h2>
      <p className="text-slate-400 text-sm mb-4">Assign team members to enter weekly metrics.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {divs.map(div=>(
          <div key={div} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <div className="text-sm font-semibold text-white mb-2">{div}</div>
            <select value={assignments[div]||""} onChange={e=>onAssign(div,e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded p-1.5 text-sm">
              <option value="">Unassigned</option>
              {TEAM_MEMBERS.map(m=><option key={m}>{m}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoginScreen({onLogin}){
  const [u,setU]=useState("");
  const [p,setP]=useState("");
  const [err,setErr]=useState("");
  const submit=()=>{
    const user=LOGINS[u];
    if(user&&user.password===p) onLogin(u,user.isAdmin,user.isTherapy||false);
    else setErr("Invalid username or password.");
  };
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg">
            <svg viewBox="0 0 40 40" className="w-9 h-9" fill="none">
              <polyline points="6,34 16,20 24,26 34,8" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">ABM Division Tracker</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to continue</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1 block">Username</label>
            <input value={u} onChange={e=>setU(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500" placeholder="Enter your name"/>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1 block">Password</label>
            <input type="password" value={p} onChange={e=>setP(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500" placeholder="Enter password"/>
          </div>
          {err&&<p className="text-red-400 text-xs">{err}</p>}
          <button onClick={submit} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg transition-colors">Sign In</button>
        </div>
      </div>
    </div>
  );
}

export default function App(){
  const [user,setUser]=useState(null);
  const [isAdmin,setIsAdmin]=useState(false);
  const [isTherapy,setIsTherapy]=useState(false);
  const [page,setPage]=useState("home");
  const [sidebarOpen,setSidebarOpen]=useState(true);
  const [loaded,setLoaded]=useState(false);
  const [statuses,setStatuses]=useState(buildDefaultStatuses);
  const [comments,setComments]=useState({});
  const [pinned,setPinned]=useState([]);
  const [metrics,setMetrics]=useState({});
  const [assignments,setAssignments]=useState({});
  const [positions,setPositions]=useState([]);
  const [meetingMode,setMeetingMode]=useState(false);
  const [filters,setFilters]=useState({status:"all"});
  const [enterDiv,setEnterDiv]=useState(null);
  const [hideBanner,setHideBanner]=useState(false);

  useEffect(()=>{
    async function load(){
      const def=buildDefaultStatuses();
      try {
        const rows=await sbGet("abm_data");
        if(rows&&Array.isArray(rows)&&rows.length>0){
          const bk={};
          rows.forEach(r=>{if(r&&r.key) bk[r.key]=r.value;});
          if(bk.statuses&&typeof bk.statuses==="object"&&!Array.isArray(bk.statuses)){
            const safe={...def};
            Object.keys(def).forEach(dn=>{
              if(Array.isArray(bk.statuses[dn])&&bk.statuses[dn].length===def[dn].length&&bk.statuses[dn].every(v=>v==="green"||v==="red"))
                safe[dn]=bk.statuses[dn];
            });
            setStatuses(safe);
          }
          if(bk.comments&&typeof bk.comments==="object") setComments(bk.comments);
          if(Array.isArray(bk.pinned)) setPinned(bk.pinned);
          if(bk.metrics&&typeof bk.metrics==="object") setMetrics(bk.metrics);
          if(bk.assignments&&typeof bk.assignments==="object") setAssignments(bk.assignments);
          if(Array.isArray(bk.employees)) setPositions(bk.employees);
        }
      } catch(e){ console.error(e); }
      setLoaded(true);
    }
    load();
  },[]);

  const save=async(key,value)=>{ try{ await sbUpsert("abm_data",{key,value}); }catch(e){ console.error(e); } };

  useEffect(()=>{ if(loaded) save("statuses",statuses); },[statuses,loaded]);
  useEffect(()=>{ if(loaded) save("comments",comments); },[comments,loaded]);
  useEffect(()=>{ if(loaded) save("pinned",pinned); },[pinned,loaded]);
  useEffect(()=>{ if(loaded) save("metrics",metrics); },[metrics,loaded]);
  useEffect(()=>{ if(loaded) save("assignments",assignments); },[assignments,loaded]);
  useEffect(()=>{ if(loaded) save("employees",positions); },[positions,loaded]);

  const toggleStatus=(divName,idx)=>{
    const def=buildDefaultStatuses();
    setStatuses(s=>{
      const cur=Array.isArray(s[divName])?s[divName]:(def[divName]||[]);
      return{...s,[divName]:cur.map((v,i)=>i===idx?(v==="green"?"red":"green"):v)};
    });
  };

  const handleComment=(divName,idx,newC,ci,del=false)=>{
    const key=`${divName}-${idx}`;
    const ex=safeArr(comments[key]);
    let upd;
    if(newC) upd=[...ex,newC];
    else if(del) upd=ex.filter((_,i)=>i!==ci);
    else upd=ex.map((c,i)=>i===ci?{...c,status:c.status==="pending"?"complete":"pending"}:c);
    setComments(c=>({...c,[key]:upd}));
  };

  const togglePin=(key)=>setPinned(p=>p.includes(key)?p.filter(k=>k!==key):[...p,key]);
  const saveMetrics=(div,wk,form)=>{ setMetrics(h=>({...h,[div]:{...safeObj(h[div]),[wk]:form}})); setEnterDiv(null); };
  const getComments=(divName,idx)=>safeArr(comments[`${divName}-${idx}`]);

  const cw=getWeekKey();
  const sm=safeObj(metrics);

  let tGreen=0,tRed=0,tPending=0;
  departments.forEach(d=>d.divisions.forEach(div=>div.drivers.forEach((_,i)=>{
    const s=safeArr(statuses[div.name])[i];
    s==="red"?tRed++:tGreen++;
  })));
  Object.values(comments).forEach(arr=>safeArr(arr).forEach(c=>{if(c&&c.status==="pending")tPending++;}));
  const tDrivers=tGreen+tRed;
  const hPct=tDrivers>0?Math.round((tGreen/tDrivers)*100):100;

  const scores=TEAM_MEMBERS.map(m=>{
    let pend=0,comp=0;
    Object.values(comments).forEach(arr=>safeArr(arr).forEach(c=>{if(c&&c.author===m){c.status==="pending"?pend++:comp++;}}));
    return{name:m,pending:pend,complete:comp,total:pend+comp};
  });

  const acts={};
  TEAM_MEMBERS.forEach(m=>{acts[m]=[];});
  departments.forEach(d=>d.divisions.forEach(div=>div.drivers.forEach((driver,idx)=>{
    getComments(div.name,idx).forEach(x=>{
      if(!x||x.status!=="pending"||!x.author) return;
      if(!acts[x.author]) acts[x.author]=[];
      acts[x.author].push({divName:div.name,driver,comment:x.text||"",driverStatus:safeArr(statuses[div.name])[idx]||"green",timestamp:x.timestamp||new Date().toISOString(),priority:idx===0?"Main":`P${idx+1}`});
    });
  })));

  const myPending=useMemo(()=>{
    if(!user) return [];
    return Object.keys(DIVISION_METRICS).filter(div=>{
      if(assignments[div]!==user) return false;
      const dh=safeObj(safeObj(sm[div])[cw]);
      return !DIVISION_METRICS[div].some(dm=>dh[dm.key]!=null&&dh[dm.key]!=="");
    });
  },[user,assignments,metrics,cw]);

  if(!user) return <LoginScreen onLogin={(u,admin,therapy)=>{setUser(u);setIsAdmin(admin);setIsTherapy(therapy);setPage(therapy?"openings":"home");}}/>;
  if(!loaded) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">Loading...</div>;

  const nav=isTherapy
    ?[{id:"openings",label:"Therapy Openings",icon:Flag},{id:"providers",label:"Providers",icon:Users}]
    :[{id:"home",label:"Home",icon:Home},{id:"tracker",label:"Driver Tracker",icon:Flag},{id:"metrics",label:"Analytics",icon:BarChart3},{id:"actions",label:"Action Items",icon:CheckSquare},{id:"fte",label:"Open FTE",icon:Users},{id:"providers",label:"Providers",icon:Users},{id:"openings",label:"Therapy Openings",icon:Flag},...(isAdmin?[{id:"admin",label:"Admin",icon:Settings}]:[])];

  const titles={home:"Operations Briefing",tracker:"Driver Tracker",metrics:"Analytics",actions:"Action Items",fte:"Open FTE Positions",providers:"Provider Directory",openings:"Therapy Openings",admin:"Admin"};

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <div className={`${sidebarOpen?"w-52":"w-14"} bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-200 flex-shrink-0`}>
        <div className="flex items-center gap-3 px-3 py-4 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 40 40" className="w-5 h-5" fill="none"><polyline points="6,34 16,20 24,26 34,8" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          {sidebarOpen&&<div className="min-w-0"><div className="text-sm font-bold text-white leading-tight">ABM</div><div className="text-xs text-slate-400 leading-tight">Clinical Ops</div></div>}
          <button onClick={()=>setSidebarOpen(o=>!o)} className="ml-auto text-slate-500 hover:text-slate-300 flex-shrink-0"><Menu className="w-4 h-4"/></button>
        </div>
        <nav className="flex-1 py-3 space-y-1 px-2 overflow-y-auto">
          {nav.map(item=>{
            const Icon=item.icon;
            return (
              <button key={item.id} onClick={()=>setPage(item.id)} className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors text-left ${page===item.id?"bg-emerald-600/20 text-emerald-400":"text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}>
                <Icon className="w-4 h-4 flex-shrink-0"/>
                {sidebarOpen&&<span className="text-sm font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-slate-800 p-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{user[0]}</div>
            {sidebarOpen&&(
              <>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{user}</div>
                  <div className="text-xs text-slate-500">{isAdmin?"Admin":isTherapy?"Therapy Ops":"Team"}</div>
                </div>
                <button onClick={()=>{setUser(null);setIsAdmin(false);setIsTherapy(false);}} className="text-slate-500 hover:text-slate-300 text-xs">Out</button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">{titles[page]||"ABM"}</h1>
            <p className="text-xs text-slate-400">{new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
          </div>
          {page==="tracker"&&(
            <div className="flex rounded-lg overflow-hidden border border-slate-700">
              <button onClick={()=>setMeetingMode(false)} className={`px-3 py-1.5 text-xs font-semibold ${!meetingMode?"bg-slate-700 text-white":"text-slate-400"}`}>Normal</button>
              <button onClick={()=>setMeetingMode(true)} className={`px-3 py-1.5 text-xs font-semibold ${meetingMode?"bg-emerald-600 text-white":"text-slate-400"}`}>Meeting</button>
            </div>
          )}
        </div>

        {myPending.length>0&&!hideBanner&&(
          <div className="bg-yellow-900/40 border-b border-yellow-600 px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-yellow-300 font-bold text-sm">Metrics needed: {myPending.join(", ")}</span>
              {myPending.map(div=><button key={div} onClick={()=>setEnterDiv(div)} className="px-2 py-1 bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold rounded">Enter {div}</button>)}
            </div>
            <button onClick={()=>setHideBanner(true)} className="text-yellow-500 hover:text-yellow-300"><X className="w-4 h-4"/></button>
          </div>
        )}

        <div className="flex-1 p-6 overflow-auto">

          {page==="home"&&(
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[{label:"On Track",value:tGreen,color:"text-emerald-400",bg:"bg-emerald-500/10 border-emerald-700/30"},{label:"Needs Attention",value:tRed,color:"text-red-400",bg:"bg-red-500/10 border-red-700/30"},{label:"Pending Actions",value:tPending,color:"text-yellow-400",bg:"bg-yellow-500/10 border-yellow-700/30"},{label:"Total Drivers",value:tDrivers,color:"text-white",bg:"bg-slate-800/50 border-slate-700"}].map(s=>(
                  <div key={s.label} className={`${s.bg} rounded-xl border p-4 text-center`}><div className={`text-3xl font-bold ${s.color}`}>{s.value}</div><div className="text-xs text-slate-400 mt-1">{s.label}</div></div>
                ))}
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 flex flex-col items-center">
                  <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">Overall Health</h3>
                  <HealthCircle pct={hPct}/>
                  <div className="mt-3 w-full space-y-2">
                    {departments.map(dept=>{
                      let g=0,t=0;
                      dept.divisions.forEach(div=>div.drivers.forEach((_,i)=>{t++;if(safeArr(statuses[div.name])[i]!=="red")g++;}));
                      const pp=t>0?Math.round((g/t)*100):100;
                      return (<div key={dept.name} className="flex items-center gap-2"><span className="text-xs text-slate-400 w-36 truncate">{dept.name}</span><div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{width:`${pp}%`,background:pp>=80?"#10b981":pp>=60?"#eab308":"#ef4444"}}/></div><span className="text-xs text-slate-400 w-8 text-right">{pp}%</span></div>);
                    })}
                  </div>
                </div>
                <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 p-5">
                  <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wide">Team Scorecard</h3>
                  <div className="space-y-3">
                    {scores.map(m=>(
                      <div key={m.name} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{m.name[0]}</div>
                        <span className="text-sm text-slate-300 w-20">{m.name}</span>
                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">{m.total>0&&<div className="h-full bg-emerald-500 rounded-full" style={{width:`${(m.complete/m.total)*100}%`}}/>}</div>
                        <span className="text-xs text-slate-400 w-28 text-right">{m.complete} done · {m.pending} pending</span>
                      </div>
                    ))}
                    {scores.every(m=>m.total===0)&&<p className="text-slate-500 text-sm">No action items yet.</p>}
                  </div>
                </div>
              </div>
              {tRed>0&&(
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                  <h3 className="text-sm font-semibold text-red-400 mb-3 uppercase tracking-wide">Drivers Needing Attention</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {departments.flatMap(d=>d.divisions.flatMap(div=>div.drivers.map((driver,i)=>({dn:div.name,driver,i})).filter(x=>safeArr(statuses[x.dn])[x.i]==="red"))).map((x,idx)=>(
                      <div key={idx} className="flex items-center gap-2 bg-red-950/30 rounded-lg p-2 border border-red-900/40"><div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0"/><span className="text-xs text-slate-300">{x.dn} — {x.driver}</span></div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {page==="tracker"&&(
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <span className="text-xs text-slate-400">Filter:</span>
                {["all","red","green"].map(f=>(
                  <button key={f} onClick={()=>setFilters({status:f})} className={`px-3 py-1 rounded-lg text-xs font-semibold border ${filters.status===f?"bg-slate-700 text-white border-slate-500":"text-slate-400 border-slate-700"}`}>{f==="all"?"All":f==="red"?"Needs Attention":"On Track"}</button>
                ))}
              </div>
              {departments.map(dept=>(
                <div key={dept.name}>
                  <div className="flex items-center gap-2 mb-3"><div className="w-3 h-3 rounded-full" style={{background:dept.color}}/><h2 className="text-base font-bold text-white">{dept.name}</h2></div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    {dept.divisions.map(div=>(
                      <DivisionPanel key={div.name} division={div} statuses={safeArr(statuses[div.name])} comments={div.drivers.map((_,i)=>getComments(div.name,i))} pinnedDrivers={pinned} onToggle={toggleStatus} onAddComment={handleComment} onTogglePin={togglePin} metricsHistory={sm} assignments={assignments} currentUser={user} isAdmin={isAdmin} onEnterMetrics={setEnterDiv} meetingMode={meetingMode} filters={filters}/>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {page==="metrics"&&(
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                <h2 className="text-lg font-bold text-white mb-1">Division Metrics Overview</h2>
                <p className="text-slate-400 text-sm mb-4">Week of {cw} — Click Enter on your assigned division to add or update metrics.</p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(DIVISION_METRICS).map(([divName,divMetrics])=>{
                    try {
                      const dh=safeObj(safeObj(sm[divName])[cw]);
                      const hasData=divMetrics.some(m=>dh[m.key]!=null&&dh[m.key]!=="");
                      const assignedTo=assignments[divName]||"";
                      const canEdit=isAdmin||(assignedTo!==""&&user===assignedTo)||assignedTo==="";
                      return (
                        <div key={divName} className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div><span className="text-sm font-bold text-white">{divName}</span>{assignedTo&&<span className="text-xs text-slate-500 ml-2">· {assignedTo}</span>}</div>
                            <div className="flex items-center gap-2">
                              {!hasData&&<span className="text-xs bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded">No data</span>}
                              {canEdit&&<button onClick={()=>setEnterDiv(divName)} className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded">{hasData?"Update":"Enter"}</button>}
                            </div>
                          </div>
                          {hasData?<div className="flex flex-wrap gap-2 justify-center">{divMetrics.map(m=><Gauge key={m.key} value={dh[m.key]} target={m.target} label={m.label} unit={m.unit} higherIsBetter={m.higherIsBetter}/>)}</div>:<p className="text-slate-500 text-xs text-center py-2">{canEdit?"Click Enter above to add metrics":"No metrics entered this week"}</p>}
                        </div>
                      );
                    } catch(e){
                      return <div key={divName} className="bg-slate-800/50 rounded-lg border border-slate-700 p-4"><span className="text-sm font-bold text-white">{divName}</span></div>;
                    }
                  })}
                </div>
              </div>
            </div>
          )}

          {page==="actions"&&(
            <div className="space-y-4">
              {TEAM_MEMBERS.map(m=>(
                <div key={m} className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold">{m[0]}</div>
                    <div><h3 className="text-base font-bold text-white">{m}</h3><p className="text-xs text-slate-400">{(acts[m]||[]).length} pending action{(acts[m]||[]).length!==1?"s":""}</p></div>
                  </div>
                  {(acts[m]||[]).length===0
                    ? <p className="text-slate-500 text-sm">No pending actions.</p>
                    : <div className="space-y-2">
                        {(acts[m]||[]).map((item,i)=>(
                          <div key={i} className={`rounded-lg p-3 border ${item.driverStatus==="red"?"bg-red-950/20 border-red-800/30":"bg-slate-800/40 border-slate-700"}`}>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-bold text-slate-400">{item.divName}</span>
                                  <span className="text-xs bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">{item.priority}</span>
                                  {item.driverStatus==="red"&&<span className="text-xs bg-red-500/20 text-red-300 border border-red-500/40 px-1.5 py-0.5 rounded">Driver Red</span>}
                                </div>
                                <p className="text-xs text-slate-400 mb-1">{item.driver}</p>
                                <p className="text-sm text-slate-200">{item.comment}</p>
                              </div>
                              <span className="text-xs text-slate-500 flex-shrink-0">{daysAgo(item.timestamp)}d ago</span>
                            </div>
                          </div>
                        ))}
                      </div>
                  }
                </div>
              ))}
            </div>
          )}

          {page==="fte"&&<FTEPage positions={positions} isAdmin={isAdmin} onAdd={p=>setPositions(prev=>[...prev,p])} onRemove={id=>setPositions(prev=>prev.filter(p=>p.id!==id))} onUpdate={(id,upd)=>setPositions(prev=>prev.map(p=>p.id===id?upd:p))}/>}
          {page==="providers"&&<ProviderDirectory canEdit={isAdmin}/>}
          {page==="openings"&&<TherapyOpenings/>}
          {page==="admin"&&isAdmin&&<AdminPanel assignments={assignments} onAssign={(div,u)=>setAssignments(a=>({...a,[div]:u}))}/>}

        </div>
      </div>

      {enterDiv&&<MetricsModal division={enterDiv} history={safeObj(sm[enterDiv])} onSave={saveMetrics} onClose={()=>setEnterDiv(null)}/>}
    </div>
  );
}
