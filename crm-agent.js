/**
 * Ednex Academy — CRM AI Agent bridge
 * ------------------------------------------------------------------
 * Ye file site ke har lead ko CRM mein le jaati hai.
 *
 * Abhi: leads browser ke localStorage ('ednex_crm_leads') mein jama hoti hain,
 * aur ek JSON file ke roop mein export ki ja sakti hain — jo seedha
 * Ednex-CRM-Tracker.xlsx ke "Learners" sheet mein paste ho jaati hai.
 *
 * Baad mein: neeche CRM_ENDPOINT mein apna URL daal dein (Google Apps Script
 * web app, api/lead.php, ya koi bhi webhook) — leads wahan seedha chali jayengi.
 * Site ka apna lead-service.min.js waisa hi kaam karta rahega; ye sirf CRM layer hai.
 */
(function () {
  'use strict';

  var CONFIG = {
    CRM_ENDPOINT: '',              // e.g. 'https://script.google.com/macros/s/XXXX/exec'
    STORAGE_KEY: 'ednex_crm_leads',
    COUNTER_KEY: 'ednex_crm_counter'
  };

  // ---------- stage model (playbook ke hisaab se) ----------
  var STAGES = ['Enquiry', 'Contacted', 'Counselled', 'Demo Attended', 'Fee Discussion', 'Enrolled', 'Lost'];

  function nextLeadId() {
    var n = parseInt(localStorage.getItem(CONFIG.COUNTER_KEY) || '0', 10) + 1;
    localStorage.setItem(CONFIG.COUNTER_KEY, String(n));
    return 'L-' + String(n).padStart(4, '0');
  }

  function todayISO() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function readLeads() {
    try { return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]'); }
    catch (e) { return []; }
  }

  function writeLeads(list) {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(list));
  }

  function normaliseCourse(raw) {
    var v = (raw || '').toLowerCase();
    if (v.indexOf('digital') > -1 || v.indexOf('market') > -1) return 'Digital Marketing';
    if (v.indexOf('data') > -1 || v.indexOf('analytic') > -1) return 'Data Analytics';
    if (v.indexOf('artificial') > -1 || v.indexOf(' ai') > -1 || v.indexOf('ai') === 0) return 'Artificial Intelligence';
    if (v.indexOf('cyber') > -1) return 'Cybersecurity';
    if (v.indexOf('web') > -1 || v.indexOf('full') > -1) return 'Web Development';
    return 'Not sure — need guidance';
  }

  function captureLead(form) {
    var lead = {
      id: nextLeadId(),
      name: (form.name || '').trim(),
      phone: (form.mobile || form.phone || '').trim(),
      email: (form.email || '').trim(),
      course: normaliseCourse(form.course),
      source: (form.source || 'Website Form').trim(),
      campaign: form.campaign || '',
      enquiryDate: todayISO(),
      stage: 'Enquiry',
      owner: '',
      lastTouch: todayISO(),
      feeQuoted: '',
      lostReason: '',
      notes: (form.description || form.message || '').trim(),
      capturedAt: new Date().toISOString(),
      pageUrl: location.href
    };

    var all = readLeads();
    all.push(lead);
    writeLeads(all);

    // Server par bhejne ki koshish — fail ho to lead local rehti hai, gum nahi hoti
    if (CONFIG.CRM_ENDPOINT) {
      fetch(CONFIG.CRM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead)
      }).catch(function () { /* queued locally, sync later */ });
    }

    console.log('[CRM Agent] Lead captured:', lead);
    return lead;
  }

  // ---------- site ke form ko hook karo (dono forms: popup + page) ----------
  function hookForms() {
    document.querySelectorAll('form.lead-form').forEach(function (f) {
      if (f.dataset.crmHooked) return;
      f.dataset.crmHooked = '1';
      f.addEventListener('submit', function () {
        // site ka apna handler chalne do, phir hum lead utha lete hain
        var data = {
          name: (f.querySelector('[name="name"]') || {}).value,
          mobile: (f.querySelector('[name="mobile"]') || {}).value,
          email: (f.querySelector('[name="email"]') || {}).value,
          course: (f.querySelector('[name="course"]') || {}).value,
          description: (f.querySelector('[name="description"]') || {}).value
        };
        if (!data.name || !data.mobile) return;
        setTimeout(function () { captureLead(data); }, 120);
      }, true);
    });
  }

  // ---------- counsellor ke liye chhota dashboard (Ctrl+Shift+L) ----------
  function exportCsv() {
    var rows = readLeads();
    if (!rows.length) { alert('Abhi koi lead capture nahi hui.'); return; }
    var cols = ['id','name','phone','email','course','source','campaign','enquiryDate','stage','owner','lastTouch','feeQuoted','lostReason','notes'];
    var csv = [cols.join(',')].concat(rows.map(function (r) {
      return cols.map(function (c) {
        var v = String(r[c] == null ? '' : r[c]).replace(/"/g, '""');
        return '"' + v + '"';
      }).join(',');
    })).join('\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ednex-leads-' + todayISO() + '.csv';
    a.click();
  }

  function showPanel() {
    var existing = document.getElementById('crm-agent-panel');
    if (existing) { existing.remove(); return; }
    var rows = readLeads();
    var panel = document.createElement('div');
    panel.id = 'crm-agent-panel';
    panel.style.cssText = 'position:fixed;right:18px;bottom:18px;width:340px;max-height:70vh;overflow:auto;background:#fff;border:1px solid #e2e8f0;border-radius:14px;box-shadow:0 24px 60px -20px rgba(0,0,0,.35);z-index:99999;font-family:system-ui,sans-serif;font-size:13px';
    var byStage = {};
    rows.forEach(function (r) { byStage[r.stage] = (byStage[r.stage] || 0) + 1; });
    var stageHtml = STAGES.map(function (s) {
      return '<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px dashed #eef2f7"><span>' + s + '</span><b>' + (byStage[s] || 0) + '</b></div>';
    }).join('');
    panel.innerHTML =
      '<div style="background:#c81e2b;color:#fff;padding:12px 16px;border-radius:14px 14px 0 0;display:flex;justify-content:space-between;align-items:center">' +
        '<b style="font-size:13.5px">CRM Agent — ' + rows.length + ' lead</b>' +
        '<span style="cursor:pointer;font-size:17px" id="crm-close">&times;</span>' +
      '</div>' +
      '<div style="padding:14px 16px">' +
        stageHtml +
        '<div style="display:flex;gap:8px;margin-top:14px">' +
          '<button id="crm-export" style="flex:1;padding:9px;border:none;border-radius:8px;background:#17191d;color:#fff;font-weight:600;cursor:pointer;font-family:inherit">Export CSV</button>' +
          '<button id="crm-clear" style="padding:9px 12px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;cursor:pointer;font-family:inherit">Clear</button>' +
        '</div>' +
        '<p style="color:#64748b;font-size:11.5px;margin-top:10px;line-height:1.5">CSV ko Ednex-CRM-Tracker.xlsx ke Learners sheet mein paste karein.</p>' +
      '</div>';
    document.body.appendChild(panel);
    document.getElementById('crm-close').onclick = function () { panel.remove(); };
    document.getElementById('crm-export').onclick = exportCsv;
    document.getElementById('crm-clear').onclick = function () {
      if (confirm('Saari local leads hata dein? Export pehle kar lein.')) { writeLeads([]); panel.remove(); }
    };
  }

  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'L' || e.key === 'l')) { e.preventDefault(); showPanel(); }
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hookForms);
  else hookForms();

  window.EdnexCRM = { captureLead: captureLead, exportCsv: exportCsv, readLeads: readLeads, STAGES: STAGES };
})();
