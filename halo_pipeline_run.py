# halo_pipeline_run.py
# Run this in a Python 3.9+ environment. Install packages: numpy pandas scikit-learn matplotlib imbalanced-learn shap joblib

import numpy as np, pandas as pd, math, os, joblib
from pathlib import Path
out_dir = Path('./api/outputs') # Save outputs inside the API folder
out_dir.mkdir(parents=True, exist_ok=True)

np.random.seed(42)

# ---------- Synthetic data generation ----------
N = 500
T = 3  # T0,T1,T2

def gen_ids(n): return [f"P{100000+i}" for i in range(n)]
ids = gen_ids(N)

def safe_egfr(creat, age, sex):
    try:
        c = float(creat)
        if c <= 0: c = 0.8
        egfr = 175 * (c ** -1.154) * (age ** -0.203) * (0.742 if sex=='F' else 1.0)
        return round(max(5.0, min(150.0, float(egfr))),1)
    except Exception:
        return 60.0

rows = []
for pid in ids:
    age = int(np.random.randint(60,95)); sex = np.random.choice(['M','F'], p=[0.48,0.52])
    bmi = round(max(15, np.random.normal(27,4)),1)
    dm_dur = int(max(0, np.random.exponential(8))); htn_dur = int(max(0, np.random.exponential(10)))
    frailty_cfs = int(min(9, max(1, np.random.poisson(3))))
    frailty_fried = int(min(5, max(0, np.random.poisson(1))))
    adl = int(max(0, min(6, np.random.poisson(5)))); iadl = int(max(0, min(8, np.random.poisson(6))))
    mmse = int(max(0, min(30, np.random.normal(27,3)))); moca = int(max(0, min(30, np.random.normal(25,4))))
    insulin = int(np.random.rand() < 0.25); med_count = int(max(0, np.random.poisson(5)))
    primary_visits = int(np.random.poisson(3)); spec_visits = int(np.random.poisson(1)); ed_visits = int(np.random.poisson(0.2))
    base_creat = round((0.9 if sex=='M' else 0.7) + 0.01*(age-60) + np.random.normal(0,0.16),2)
    base_hba1c = round(max(4.5, np.random.normal(7.6,1.3)),2)
    prev_sbp = None; prev_hba = None
    for t in range(T):
        creat = round(base_creat + np.random.normal(0,0.16),2)
        egfr = safe_egfr(creat, age, sex)
        hba1c = round(prev_hba + np.random.normal(0,0.35),2) if prev_hba is not None else base_hba1c
        sbp = int(np.round(prev_sbp + np.random.normal(0,9))) if prev_sbp is not None else int(np.round(np.random.normal(140,16)))
        dbp = int(np.round(np.random.normal(80,9)))
        weight = round(60 + (bmi-22)*0.7 + np.random.normal(0,3),1)
        ldl = round(max(40, np.random.normal(110,32)),1); hdl = round(max(25, np.random.normal(48,9)),1)
        trig = round(abs(np.random.normal(140,60)),1); acr = round(abs(np.random.normal(20,50)),1)
        hypo = int((np.random.rand() < (0.01 + 0.06*insulin + (hba1c<7.0)*0.02)))
        severe = int(hypo and (np.random.rand() < 0.12))
        uncontrolled = int((sbp>140) or (dbp>90))
        mi = int(np.random.rand() < (0.005 + (age-60)*0.003 + max(0,(sbp-140))*0.001))
        stroke = int(mi and np.random.rand() < 0.4); hf = int(np.random.rand() < 0.01); aki = int(np.random.rand() < 0.004)
        hosp = int(mi or stroke or hf or aki)
        row = {
            'patient_id': pid, 'sex': sex, 'age_at_index': age, 'bmi': bmi,
            'dm_duration_years': dm_dur, 'htn_duration_years': htn_dur,
            'frailty_cfs': frailty_cfs, 'frailty_fried': frailty_fried,
            'adl_score': adl, 'iadl_score': iadl, 'mmse': mmse, 'moca': moca,
            'insulin_flag': insulin, 'med_count': med_count,
            'primary_care_visits_12mo': primary_visits, 'specialist_visits_12mo': spec_visits, 'ed_visits_12mo': ed_visits,
            f'visit_month_T{t}': ['2023-01','2023-07','2024-01'][t],
            f'sbp_T{t}': sbp, f'dbp_T{t}': dbp, f'hr_T{t}': int(np.round(np.random.normal(76,8))),
            f'weight_kg_T{t}': weight, f'hba1c_T{t}': hba1c,
            f'fpg_T{t}': int(abs(np.random.normal(140,35))), f'rpg_T{t}': int(abs(np.random.normal(180,60))),
            f'creatinine_T{t}': creat, f'eGFR_T{t}': egfr,
            f'ldl_T{t}': ldl, f'hdl_T{t}': hdl, f'trig_T{t}': trig, f'acr_T{t}': acr,
            f'hemoglobin_T{t}': round(np.random.normal(13 if sex=='M' else 12,1.2),1),
            f'event_hypo_T{t}': hypo, f'event_severe_hypo_T{t}': severe, f'event_uncontrolled_htn_T{t}': uncontrolled,
            f'event_MI_T{t}': mi, f'event_stroke_T{t}': stroke, f'event_HF_hosp_T{t}': hf, f'event_AKI_T{t}': aki,
            f'hospitalization_flag_T{t}': hosp
        }
        rows.append(row)
        prev_sbp = sbp; prev_hba = hba1c

# collapse to one wide row per patient
patients = {}
for r in rows:
    pid = r['patient_id']
    patients.setdefault(pid, {}).update(r)
df_wide = pd.DataFrame(list(patients.values()))
df_wide.to_csv(out_dir/'synthetic_halo_wide_500.csv', index=False)
print("Wide-format generated:", (out_dir/'synthetic_halo_wide_500.csv'))

# ---------- Frailty-driven correlated missingness ----------
df = df_wide.copy()
rng = np.random.default_rng(2025)
for idx, r in df.iterrows():
    frailty = r.get('frailty_cfs', 3)
    if pd.isna(frailty): frailty = 3
    if frailty <=2: p1,p2,p_cog = 0.35,0.45,0.75
    elif frailty <=4: p1,p2,p_cog = 0.18,0.25,0.5
    else: p1,p2,p_cog = 0.08,0.12,0.3
    for base, (a,b) in [('hba1c',(p1,p2)),('ldl',(p1,p2)),('hdl',(p1,p2)),('trig',(p1,p2)),('acr',(p1,p2)),('creatinine',(p1,p2)),('eGFR',(p1,p2))]:
        c1=f'{base}_T1'; c2=f'{base}_T2'
        if c1 in df.columns and rng.random() < a: df.at[idx,c1]=np.nan
        if c2 in df.columns and rng.random() < b: df.at[idx,c2]=np.nan
    for c in ['frailty_cfs','frailty_fried','adl_score','iadl_score','mmse','moca']:
        if c in df.columns and rng.random() < p_cog: df.at[idx,c]=np.nan
    for t,prob in [(1,0.12 if frailty<=2 else 0.04),(2,0.12 if frailty<=2 else 0.04)]:
        for c in [f'sbp_T{t}', f'dbp_T{t}', f'weight_kg_T{t}']:
            if c in df.columns and rng.random() < prob: df.at[idx,c]=np.nan
df.to_csv(out_dir/'synthetic_halo_wide_500_missing.csv', index=False)
print("Correlated-missing saved:", out_dir/'synthetic_halo_wide_500_missing.csv')

# ---------- MICE (IterativeImputer) ----------
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer
from sklearn.linear_model import BayesianRidge

df2 = df.copy()
tp_cols = [c for c in df2.columns if any(s in c for s in ['_T0','_T1','_T2'])]
for c in tp_cols: df2[c] = pd.to_numeric(df2[c], errors='coerce')
orig_missing = df2[tp_cols].isna().copy()
valid = [c for c in tp_cols if df2[c].notna().sum()>0]
if valid:
    Xnum = df2[valid].values
    imp = IterativeImputer(estimator=BayesianRidge(), max_iter=8, random_state=0, sample_posterior=True)
    Ximp = imp.fit_transform(Xnum)
    for i,c in enumerate(valid): df2[c] = Ximp[:,i]
 
imputed_cols = {} 
for c in tp_cols:
    if c not in valid: df2[c] = df2[c].fillna(df2[c].median())
    imputed_cols[f'{c}_mice_imputed'] = orig_missing[c].astype(int) 

df2 = pd.concat([df2, pd.DataFrame(imputed_cols)], axis=1) 

df2.to_csv(out_dir/'synthetic_halo_wide_500_mice.csv', index=False)
print("MICE output saved:", out_dir/'synthetic_halo_wide_500_mice.csv')

# ---------- Rolling-window stacked dataset ----------
stack = []
for idx, r in df2.iterrows():
    pid = r['patient_id']
    for t in [0,1]:
        e = {'patient_id':pid, 'timepoint':t}
        for c in ['sex','age_at_index','bmi','dm_duration_years','htn_duration_years','insulin_flag','med_count']:
            if c in r.index: e[c]=r[c]
        for base in ['hba1c','creatinine','eGFR','ldl','hdl','trig','acr','sbp','dbp','weight_kg']:
            col=f'{base}_T{t}'; e[col]=r.get(col, np.nan)
        next_t = t+1
        e['hypo_next6m'] = int(r.get(f'event_hypo_T{next_t}',0))
        evt = sum(int(r.get(f'{x}_T{next_t}',0)) for x in ['event_MI','event_stroke','event_HF_hosp'])
        e['cv_next6m'] = int(evt>0)
        stack.append(e)
df_stack = pd.DataFrame(stack)
df_stack.to_csv(out_dir/'synthetic_halo_rolling_stacked.csv', index=False)
print("Stacked dataset saved:", out_dir/'synthetic_halo_rolling_stacked.csv')

# ---------- Modeling + CV (SMOTE optional) ----------
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_curve, auc
from sklearn.calibration import calibration_curve
import matplotlib.pyplot as plt

feat_cols = [c for c in df_stack.columns if c not in ['patient_id','timepoint','hypo_next6m','cv_next6m','sex']]
if 'sex' in df_stack.columns:
    df_stack['sex_M'] = (df_stack['sex']=='M').astype(int); feat_cols.append('sex_M')
X = df_stack[feat_cols].fillna(df_stack[feat_cols].median()); y = df_stack['hypo_next6m']

skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
mean_fpr = np.linspace(0,1,100); tprs=[]; aucs=[]; all_probs=[]; all_y=[]
has_smote=False
try:
    from imblearn.over_sampling import SMOTE; has_smote=True
except Exception:
    has_smote=False

plt.figure(figsize=(8,6)); fold=0
for train_idx,test_idx in skf.split(X,y):
    X_tr,X_te = X.iloc[train_idx], X.iloc[test_idx]; y_tr,y_te = y.iloc[train_idx], y.iloc[test_idx]
    if has_smote and y_tr.nunique()>1 and y_tr.mean()<0.4:
        sm = SMOTE(random_state=42); X_tr_res,y_tr_res = sm.fit_resample(X_tr,y_tr)
    else:
        X_tr_res,y_tr_res = X_tr,y_tr
    clf = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
    clf.fit(X_tr_res, y_tr_res)
    probs = clf.predict_proba(X_te)[:,1]
    fpr,tpr,_ = roc_curve(y_te, probs); interp = np.interp(mean_fpr, fpr, tpr); interp[0]=0.0
    tprs.append(interp); aucs.append(auc(fpr,tpr))
    plt.plot(fpr,tpr, lw=1, alpha=0.6, label=f'Fold {fold} AUC={aucs[-1]:.3f}')
    fold+=1; all_probs.extend(list(probs)); all_y.extend(list(y_te))
mean_tpr = np.mean(tprs, axis=0); mean_tpr[-1]=1.0; mean_auc=auc(mean_fpr, mean_tpr)
plt.plot(mean_fpr, mean_tpr, color='black', lw=2, label=f'Mean ROC AUC={mean_auc:.3f}')
plt.plot([0,1],[0,1],'--', lw=1); plt.xlabel('FPR'); plt.ylabel('TPR'); plt.title('K-fold ROC (hypo next-6m)'); plt.legend(loc='lower right')
plt.tight_layout(); plt.savefig(out_dir/'halo_kfold_roc.png'); plt.close()

probs_arr = np.array(all_probs); y_arr = np.array(all_y)
prob_true, prob_pred = calibration_curve(y_arr, probs_arr, n_bins=10, strategy='uniform')
plt.figure(figsize=(6,6)); plt.plot(prob_pred, prob_true, marker='o'); plt.plot([0,1],[0,1],'--'); plt.xlabel('Predicted'); plt.ylabel('Observed'); plt.title('Calibration (aggregate)')
plt.tight_layout(); plt.savefig(out_dir/'halo_calibration.png'); plt.close()

# ---------- SHAP attempt ----------
shap_note = ''
try:
    import shap
    final_clf = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
    if has_smote and y.nunique()>1 and y.mean()<0.4:
        sm = SMOTE(random_state=42); Xr,yr = sm.fit_resample(X,y); final_clf.fit(Xr,yr)
    else:
        final_clf.fit(X,y)
    expl = shap.TreeExplainer(final_clf); sv = expl.shap_values(X)
    import matplotlib.pyplot as plt
    plt.figure(figsize=(8,6))
    if isinstance(sv, list): shap.summary_plot(sv[1], X, show=False)
    else: shap.summary_plot(sv, X, show=False)
    plt.tight_layout(); plt.savefig(out_dir/'halo_shap_summary.png'); plt.close()
    shap_note = 'SHAP generated'
except Exception as e:
    shap_note = f'SHAP not generated: {e}'
    with open(out_dir/'halo_shap_error.txt','w') as f: f.write(shap_note)

# ---------- quick report ----------
X_tr,X_te,y_tr,y_te = train_test_split(X,y,test_size=0.2, random_state=42, stratify=y)
rep_clf = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
if has_smote and y_tr.nunique()>1 and y_tr.mean()<0.4:
    sm = SMOTE(random_state=42); X_trr,y_trr = sm.fit_resample(X_tr,y_tr); rep_clf.fit(X_trr,y_trr)
else:
    rep_clf.fit(X_tr,y_tr)
y_pred = rep_clf.predict(X_te)
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score
acc = accuracy_score(y_te,y_pred); roc = roc_auc_score(y_te, rep_clf.predict_proba(X_te)[:,1]) if len(set(y_te))>1 else float('nan')
crep = classification_report(y_te,y_pred, zero_division=0)
md = f"# HALO evaluation\nAccuracy: {acc:.4f}\nROC AUC: {roc:.4f}\n\n```\n{crep}\n```\n\nSHAP status: {shap_note}\n"
with open(out_dir/'halo_evaluation_report.md','w') as f: f.write(md)

# Save the final trained model and feature list
model_filename = Path('./api/hypo_risk_rf_model.joblib')
joblib.dump(rep_clf, model_filename)

feature_cols_df = pd.DataFrame({'features': feat_cols})
feature_cols_df.to_csv(out_dir / 'hypo_risk_model_features.csv', index=False)

print("\nDone. Outputs written to:", out_dir)
print("- model:", model_filename)
print("- features:", out_dir / 'hypo_risk_model_features.csv')
print("- report:", out_dir/'halo_evaluation_report.md')