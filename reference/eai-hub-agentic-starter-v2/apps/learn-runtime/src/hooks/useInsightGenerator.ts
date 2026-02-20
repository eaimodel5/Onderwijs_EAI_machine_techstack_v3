
import { useMemo } from 'react';
import { Message } from '../types';
import { useEvAI56Rubrics, RubricAssessment } from './useEvAI56Rubrics';

interface PersonalizedInsight {
  id: string;
  type: 'strength' | 'growth' | 'pattern' | 'recommendation';
  title: string;
  description: string;
  actionable: string;
  priority: 'low' | 'medium' | 'high';
  rubricId?: string;
  icon: string;
}

export function useInsightGenerator(messages: Message[]) {
  const { assessMessage, calculateOverallRisk, getRubricById } = useEvAI56Rubrics();

  const insights = useMemo((): PersonalizedInsight[] => {
    const userMessages = messages.filter(msg => msg.from === 'user');
    if (userMessages.length === 0) return [];

    const allAssessments: RubricAssessment[] = [];
    userMessages.forEach(msg => {
      const assessments = assessMessage(msg.content);
      allAssessments.push(...assessments);
    });

    if (allAssessments.length === 0) return [];

    const insights: PersonalizedInsight[] = [];
    const rubricScores = new Map<string, { risk: number; protective: number; count: number }>();

    // Aggregate scores per rubric
    allAssessments.forEach(assessment => {
      const current = rubricScores.get(assessment.rubricId) || { risk: 0, protective: 0, count: 0 };
      rubricScores.set(assessment.rubricId, {
        risk: current.risk + assessment.riskScore,
        protective: current.protective + assessment.protectiveScore,
        count: current.count + 1
      });
    });

    // Generate insights for each rubric
    rubricScores.forEach((scores, rubricId) => {
      const rubric = getRubricById(rubricId);
      if (!rubric) return;

      const avgRisk = scores.risk / scores.count;
      const avgProtective = scores.protective / scores.count;
      const netScore = avgRisk - avgProtective;

      // Strength insights (high protective factors)
      if (avgProtective >= 2) {
        insights.push({
          id: `strength-${rubricId}`,
          type: 'strength',
          title: `Sterke ${rubric.name}`,
          description: `Je toont consistente sterke punten in ${rubric.name.toLowerCase()}. Dit is een belangrijke beschermende factor.`,
          actionable: `Blijf deze sterkte ontwikkelen en gebruik het als fundament voor andere gebieden.`,
          priority: 'low',
          rubricId,
          icon: '💪'
        });
      }

      // Growth opportunities (high risk, low protective)
      if (netScore > 1) {
        insights.push({
          id: `growth-${rubricId}`,
          type: 'growth',
          title: `Groeikans: ${rubric.name}`,
          description: `Er zijn mogelijkheden om te groeien in ${rubric.name.toLowerCase()}. Focus op het ontwikkelen van nieuwe strategieën.`,
          actionable: rubric.interventions[0] || `Overweeg professionele ondersteuning voor ${rubric.name.toLowerCase()}.`,
          priority: netScore > 2 ? 'high' : 'medium',
          rubricId,
          icon: '🌱'
        });
      }

      // Balanced insights (moderate scores)
      if (netScore >= -0.5 && netScore <= 1 && scores.count >= 2) {
        insights.push({
          id: `pattern-${rubricId}`,
          type: 'pattern',
          title: `Ontwikkelingspatroon: ${rubric.name}`,
          description: `Je toont een gemengd patroon in ${rubric.name.toLowerCase()}. Beide uitdagingen en sterke punten zijn aanwezig.`,
          actionable: `Focus op het versterken van je positieve strategieën terwijl je werkt aan de uitdagingen.`,
          priority: 'medium',
          rubricId,
          icon: '⚖️'
        });
      }
    });

    // Overall recommendations based on conversation patterns
    const overallRisk = calculateOverallRisk(allAssessments);
    const totalMessages = userMessages.length;
    const recentMessages = userMessages.slice(-3);

    // Progress insight
    if (totalMessages >= 5) {
      const recentAssessments = recentMessages.flatMap(msg => assessMessage(msg.content));
      const recentRisk = calculateOverallRisk(recentAssessments);
      
      if (recentRisk < overallRisk - 10) {
        insights.push({
          id: 'progress-positive',
          type: 'strength',
          title: 'Positieve Vooruitgang',
          description: 'Je recente berichten tonen een verbetering in je emotionele toestand.',
          actionable: 'Reflecteer op wat goed werkt en blijf deze strategieën toepassen.',
          priority: 'medium',
          icon: '📈'
        });
      }
    }

    // Self-awareness insight
    const selfAwarenessAssessments = allAssessments.filter(a => a.rubricId === 'self-awareness');
    if (selfAwarenessAssessments.length > 0) {
      const avgSelfAwareness = selfAwarenessAssessments.reduce((sum, a) => sum + a.protectiveScore, 0) / selfAwarenessAssessments.length;
      if (avgSelfAwareness >= 1.5) {
        insights.push({
          id: 'self-awareness-strength',
          type: 'strength',
          title: 'Sterke Zelfbewustzijn',
          description: 'Je toont een goed vermogen tot zelfreflectie en bewustzijn van je emoties.',
          actionable: 'Gebruik dit zelfbewustzijn om andere aspecten van je welzijn te verbeteren.',
          priority: 'low',
          icon: '🧠'
        });
      }
    }

    // Sort by priority and limit to most relevant
    return insights
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 6); // Limit to 6 most relevant insights

  }, [messages, assessMessage, calculateOverallRisk, getRubricById]);

  const getInsightsByType = (type: PersonalizedInsight['type']) => 
    insights.filter(insight => insight.type === type);

  const getPriorityInsights = () => 
    insights.filter(insight => insight.priority === 'high');

  return {
    insights,
    getInsightsByType,
    getPriorityInsights,
    hasInsights: insights.length > 0
  };
}
