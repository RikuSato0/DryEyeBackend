/**
 * Dry Eye Diagnostic Engine
 * Supports: ADDE, Mild EDE, Severe EDE, Allergy, Post-op Tear Film Instability,
 * Environmental Impact, Anterior Blepharitis, Mild EDE (Fallback)
 * Based on 20-question answers.
 */

function diagnoseDryEye(answers) {
  const getPoints = (map, q, a) => (map[q] && map[q][a]) || 0;

  // Each diagnosis has weight rules, blockers, thresholds
  const diagnoses = {
    ADDE: {
      minPoints: 6,
      required: [["Q2", ["C", "D"]]],
      highWeight: {
        Q2: { C: 1.5, D: 1.5 },
        Q17: { C: 1.5 },
        Q9: { D: 1.5 },
      },
      strong: {
        Q3: { C: 1.0, D: 1.0 },
        Q4: { C: 1.0, D: 1.0 },
        Q7: { C: 1.0, D: 1.0 },
        Q11: { C: 1.0, D: 1.0 },
        Q19: { C: 1.0, D: 1.0 },
      },
      blockers: q => q.Q2 === "A" || (q.Q17 === "A" && !["C", "D"].includes(q.Q2)),
    },

    SevereEDE: {
      minPoints: 9,
      required: [["Q1", ["C", "D"]]],
      highWeight: {
        Q1: { D: 3.0 },
        Q5: { D: 1.5 },
        Q6: { D: 1.5 },
        Q11: { D: 1.5 },
      },
      strong: {
        Q1: { C: 1.0 },
        Q3: { D: 1.0 },
        Q4: { D: 1.0 },
        Q7: { D: 1.0 },
        Q9: { B: 1.0 },
        Q8: { D: 1.0 },
        Q15: { D: 1.0 },
        Q19: { D: 1.0 },
      },
      blockers: q => q.Q2 === "D" && totalScore(q, "SevereEDE") < 11,
    },

    MildEDE: {
      minPoints: 5,
      heavyReq: 1.5,
      highWeight: {
        Q1: { B: 1.5 },
        Q3: { C: 1.5 },
        Q7: { C: 1.5, D: 1.5 },
      },
      strong: {
        Q19: { C: 1.0 },
        Q4: { C: 1.0 },
        Q5: { B: 1.0, C: 1.0 },
        Q6: { B: 1.0, C: 1.0 },
        Q9: { B: 1.0, C: 1.0 },
        Q11: { B: 1.0, C: 1.0 },
        Q15: { B: 1.0, C: 1.0 },
        Q20: { B: 1.0, C: 1.0 },
      },
      blockers: q => q.Q1 === "A" || q.Q2 === "D",
    },

    Allergy: {
      minPoints: 6,
      heavyReq: 3.0,
      highWeight: {
        Q13: { D: 1.5 },
        Q14: { D: 1.5 },
        Q15: { D: 1.5 },
      },
      strong: {
        Q13: { C: 1.0 },
        Q6: { C: 1.0, D: 1.0 },
        Q3: { C: 1.0 },
        Q4: { B: 1.0, C: 1.0 },
      },
      blockers: q => q.Q13 === "A" || ["C", "D"].includes(q.Q18) || q.Q2 === "D",
    },

    PostOp: {
      minPoints: 6.5,
      heavyReq: 3.0,
      highWeight: {
        Q10: { B: 1.5, C: 1.5, D: 1.5 },
        Q1: { C: 1.5, D: 1.5 },
        Q3: { D: 1.5 },
        Q7: { D: 1.5 },
      },
      strong: {
        Q3: { C: 1.0 },
        Q4: { C: 1.0, D: 1.0 },
        Q6: { C: 1.0, D: 1.0 },
        Q11: { C: 1.0, D: 1.0 },
        Q12: { C: 1.0, D: 1.0 },
        Q19: { C: 1.0, D: 1.0 },
      },
      blockers: q => q.Q10 === "A",
    },

    Environmental: {
      minPoints: 6,
      heavyReq: 1.0,
      highWeight: {
        Q19: { D: 1.5 },
        Q7: { D: 1.5 },
      },
      strong: {
        Q19: { C: 1.0 },
        Q3: { C: 1.0, D: 1.0 },
        Q4: { C: 1.0, D: 1.0 },
        Q8: { A: 1.0 },
        Q6: { C: 1.0, D: 1.0 },
      },
      blockers: q => ["A", "B"].includes(q.Q19) || ["B", "C", "D"].includes(q.Q10) || q.Q2 === "D",
    },

    Blepharitis: {
      minPoints: 6.5,
      heavyReq: 2.0,
      highWeight: {
        Q18: { D: 1.5 },
        Q9: { C: 1.5 },
        Q8: { D: 1.5 },
        Q15: { D: 1.5 },
      },
      strong: {
        Q18: { C: 1.0 },
        Q5: { C: 1.0 },
        Q8: { C: 1.0 },
        Q14: { C: 1.0, D: 1.0 },
        Q6: { C: 1.0, D: 1.0 },
        Q11: { C: 1.0, D: 1.0 },
        Q1: { C: 1.0, D: 1.0 },
      },
      blockers: q => q.Q18 === "A" || q.Q14 === "A" || q.Q13 === "D",
    }
  };

  const results = [];

  for (const key in diagnoses) {
    const diag = diagnoses[key];
    let score = 0, heavy = 0;

    // Must-have answers check
    if (diag.required && !diag.required.every(([q, vals]) => vals.includes(answers[q]))) continue;
    if (diag.blockers && diag.blockers(answers)) continue;

    for (const q in diag.highWeight) {
      const pts = getPoints(diag.highWeight, q, answers[q]);
      score += pts;
      heavy += pts;
    }
    for (const q in diag.strong) {
      score += getPoints(diag.strong, q, answers[q]);
    }

    if (score >= diag.minPoints && (!diag.heavyReq || heavy >= diag.heavyReq)) {
      results.push({ diagnosis: key, score, heavy });
    }
  }

  // Diagnostic prioritization
  const priority = ["SevereEDE", "ADDE", "PostOp", "Blepharitis", "Environmental", "MildEDE", "Allergy"];
  results.sort((a, b) => priority.indexOf(a.diagnosis) - priority.indexOf(b.diagnosis));

  // Combination logic & fallback
  if (results.length === 0) {
    let fallbackScore = 0;
    const fallbackTable = {
      Q3: { B: 1.0, C: 1.0, D: 1.0 },
      Q4: { B: 0.5, C: 0.5, D: 0.5 },
      Q5: { B: 0.5, C: 0.5, D: 0.5 },
      Q6: { B: 0.5, C: 0.5, D: 0.5 },
      Q7: { B: 0.5, C: 0.5, D: 0.5 },
      Q8: { B: 0.5, C: 0.5, D: 0.5 },
      Q15: { B: 0.5, C: 0.5, D: 0.5 },
    };
    for (const q in fallbackTable) fallbackScore += getPoints(fallbackTable, q, answers[q]);
    if (fallbackScore >= 1.5) return { primary: "MildEDE", secondary: null, score: fallbackScore };
    return { primary: null, secondary: null, score: 0, comment: "No valid diagnosis" };
  }

  return {
    primary: results[0].diagnosis,
    secondary: results[1] ? results[1].diagnosis : null,
    score: results[0].score
  };
}

module.exports = { diagnoseDryEye };
