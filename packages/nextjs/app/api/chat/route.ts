import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const { messages, conversationId, lotCode } = await req.json();

  console.log("Chat API received:", { messagesCount: messages?.length, conversationId, lotCode });

  if (!messages || messages.length === 0) {
    console.error("No messages provided");
    return new Response("No messages provided", { status: 400 });
  }

  try {
    let systemPrompt = `You are Harvverse AI Agent, an expert advisor for coffee farm investments and operations.`;

    try {
      console.log("Attempting to fetch real data from Convex...");

      // Fetch data directly from Convex using ConvexHttpClient
      const lotCode_ = lotCode || "zafiro-001";
      const moduleId = "50e963ae-6454-436f-b8b3-4a3740b22572";

      // Call queries directly
      const lotInfo = await convex.query("ai/tools:getLotInfo" as any, { lotCode: lotCode_ });
      const planInfo = await convex.query("ai/tools:getPlanInfo" as any, { planCode: `${lotCode_}-y1` });
      const agronomicPlanData = await convex.query("ai/tools:getAgronomicPlanByLot" as any, { lotCode: lotCode_ });
      const sensorData = await convex.query("ai/tools:getSensorData" as any, { moduleId, weeks: 4 });
      const growthMetrics = await convex.query("ai/tools:calculateGrowthMetrics" as any, { moduleId, weeks: 4 });
      const anomalies = await convex.query("ai/tools:detectAnomalies" as any, { moduleId, weeks: 8 });
      const yieldPred = await convex.query("ai/tools:predictYield" as any, { moduleId, historicalWeeks: 12 });

      console.log("Got data from Convex");

      // Build system prompt with REAL data
      let dataPrompt = `You are Harvverse AI Agent, an expert advisor for coffee farm investments and operations.

You have access to the following REAL DATA from the Harvverse system. This is the ONLY data you should use to answer questions.

`;

      if (lotInfo?.success && lotInfo?.lot) {
        dataPrompt += `**INFORMACIÓN DEL LOTE:**
- Código: ${lotInfo.lot.code}
- Finca: ${lotInfo.lot.farmName}
- Región: ${lotInfo.lot.region}
- País: ${lotInfo.lot.country}
- Varietal: ${lotInfo.lot.varietal}
- Proceso: ${lotInfo.lot.process}
- Altitud: ${lotInfo.lot.altitudeMasl} msnm
- Hectáreas: ${lotInfo.lot.hectares}
- Puntaje SCA: ${lotInfo.lot.scaScore}
- Año de cosecha: ${lotInfo.lot.harvestYear}
- Estado: ${lotInfo.lot.status}
- Resumen: ${lotInfo.lot.summary}

`;
      }

      if (planInfo?.success && planInfo?.plan) {
        dataPrompt += `**INFORMACIÓN DEL PLAN DE INVERSIÓN:**
- Código del plan: ${planInfo.plan.planCode}
- Precio del ticket: $${planInfo.plan.ticketUSD} USD
- Precio por libra: $${(planInfo.plan.priceCentsPerLb / 100).toFixed(2)} USD
- Rendimiento proyectado Y1: ${planInfo.plan.projectedYieldY1} quintales
- Techo de rendimiento Y1: ${planInfo.plan.yieldCapY1} quintales
- Split del agricultor: ${planInfo.plan.splitFarmerPercent}%
- Estado: ${planInfo.plan.status}
- Términos: ${planInfo.plan.termsSummary}

IMPORTANTE: Este es el ÚNICO plan disponible para este lote. NO hay otros planes.

`;
      }

      if (agronomicPlanData?.success && agronomicPlanData?.plan) {
        const plan = agronomicPlanData.plan;
        dataPrompt += `**PLAN AGRONÓMICO DETALLADO:**
- Plan ID: ${plan.planId}
- Variedad: ${plan.variety}
- Altitud: ${plan.altitudeMsnm} msnm
- Área: ${plan.areaHectares} hectáreas
- Ciclo: ${plan.cycleYear}
- Precio por libra (fijo): $${plan.pricePerLbFixed} USD
- Piso de precio: $${plan.priceFloor} USD
- Rendimiento Y1: ${plan.yieldY1Qq} quintales
- Rendimiento Y2: ${plan.yieldY2Qq} quintales
- Rendimiento Y3: ${plan.yieldY3Qq} quintales
- Techo de rendimiento: ${plan.yieldCeilingQq} quintales
- Split agricultor: ${(plan.splitFarmer * 100).toFixed(0)}%
- Split socio: ${(plan.splitPartner * 100).toFixed(0)}%
- Café phygital: ${plan.phygitalCoffeeLb} libras
- Entrega phygital: ${plan.phygitalDelivery}
- Perfil: ${plan.profile}
- Validador: ${plan.validatorName} (${plan.validatorTitle})

Reglas del contrato:
- Techo de rendimiento: Y1=${plan.contractRules.yieldCeiling.y1}qq, Y2=${plan.contractRules.yieldCeiling.y2}qq, Y3=${plan.contractRules.yieldCeiling.y3}qq, Absoluto=${plan.contractRules.yieldCeiling.absolute}qq
- Piso de rendimiento: Normal=${plan.contractRules.yieldFloor.normal}qq, Fuerza Mayor=${plan.contractRules.yieldFloor.forceMajeure}qq, Severo=${plan.contractRules.yieldFloor.severe}qq, Catastrófico=${plan.contractRules.yieldFloor.catastrophe}qq
- Precio fijo: $${plan.contractRules.priceFixed} USD/lb
- Fórmula de upside: ${plan.contractRules.upsideFormula}

Hitos del plan:
`;
        plan.milestones.forEach((m: any) => {
          dataPrompt += `  ${m.number}. ${m.name} (Meses ${m.monthStart}-${m.monthEnd}): $${m.cash}k cash + $${m.marketplace}k marketplace = $${m.total}k (${m.pct}%)\n`;
        });
        dataPrompt += "\n";

        if (plan.activities && plan.activities.length > 0) {
          dataPrompt += `Actividades detalladas por hito:\n`;
          const activitiesByMilestone: { [key: number]: any[] } = {};
          plan.activities.forEach((a: any) => {
            if (!activitiesByMilestone[a.milestone]) {
              activitiesByMilestone[a.milestone] = [];
            }
            activitiesByMilestone[a.milestone].push(a);
          });

          Object.keys(activitiesByMilestone).forEach(milestoneNum => {
            const activities = activitiesByMilestone[parseInt(milestoneNum)];
            dataPrompt += `\n  Hito ${milestoneNum}:\n`;
            activities.forEach((a: any) => {
              dataPrompt += `    - ${a.icon} ${a.name} (${a.code}): $${a.cash}k cash + $${a.mkt}k marketplace\n`;
            });
          });
          dataPrompt += "\n";
        }
      }

      if (sensorData?.success && sensorData?.data && sensorData.data.length > 0) {
        dataPrompt += `**DATOS DE SENSORES (Últimas 4 semanas):**\n`;
        sensorData.data.forEach((data: any) => {
          dataPrompt += `- Semana ${data.week}: Temperatura ${data.ambientTemperature}°C, Humedad ambiental ${data.ambientHumidity}%, Humedad del suelo ${data.soilHumidity}%\n`;
        });
        dataPrompt += "\n";
      }

      if (growthMetrics?.success) {
        const metrics = growthMetrics;
        dataPrompt += `**MÉTRICAS DE CRECIMIENTO:**
- Período: ${metrics.period}
- Temperatura promedio: ${metrics.averageTemperature}°C
- Humedad promedio: ${metrics.averageHumidity}%
- Humedad del suelo promedio: ${metrics.averageSoilHumidity}%
- Rango de temperatura: ${metrics.temperatureRange.min}°C - ${metrics.temperatureRange.max}°C
- Estado de salud: ${metrics.healthStatus}

`;
      }

      if (anomalies?.success) {
        const anom = anomalies;
        dataPrompt += `**DETECCIÓN DE ANOMALÍAS:**
- Anomalías detectadas: ${anom.anomaliesDetected}
- Recomendación: ${anom.recommendation}
`;
        if (anom.anomalies && anom.anomalies.length > 0) {
          dataPrompt += `- Detalles:\n`;
          anom.anomalies.forEach((a: any) => {
            dataPrompt += `  * Semana ${a.week}: ${a.temperature}°C (desviación: ${a.deviation}°C)\n`;
          });
        }
        dataPrompt += "\n";
      }

      if (yieldPred?.success) {
        const pred = yieldPred;
        dataPrompt += `**PREDICCIÓN DE RENDIMIENTO:**
- Rendimiento predicho: ${pred.predictedYieldQQ} quintales
- Confianza: ${pred.confidence}
- Temperatura promedio: ${pred.factors.temperature}°C
- Humedad promedio: ${pred.factors.humidity}%
- Impacto de temperatura: ${pred.factors.tempImpact}
- Impacto de humedad: ${pred.factors.humidityImpact}
- Recomendación: ${pred.recommendation}

`;
      }

      dataPrompt += `⚠️ INSTRUCCIONES CRÍTICAS - DEBES SEGUIR ESTO EXACTAMENTE:

1. SOLO responde basado en los datos reales listados arriba
2. NUNCA inventes, alucines o crees datos que no están en la lista
3. Si el usuario pregunta sobre algo que no está en los datos, di claramente: "No tengo esa información en la base de datos"
4. NO crees múltiples planes si solo hay uno listado
5. NO inventes precios, rendimientos, ubicaciones o términos que no estén aquí
6. Responde en español
7. Sé específico y cita EXACTAMENTE los números que ves arriba
8. Si tienes dudas, es mejor decir "no tengo esa información" que inventar
9. NO hagas suposiciones sobre datos que no están presentes
10. Cuando el usuario pregunte sobre planes, inversiones o datos del lote, SOLO menciona lo que está en la sección "INFORMACIÓN DEL PLAN DE INVERSIÓN" y "INFORMACIÓN DEL LOTE"`;

      systemPrompt = dataPrompt;
    } catch (contextError) {
      console.warn("Could not fetch context data:", contextError);
      systemPrompt = `You are Harvverse AI Agent. You have no data available. Tell the user that you cannot access the database.`;
    }

    console.log("System prompt length:", systemPrompt.length);
    console.log("Calling Claude API with generateText...");
    const result = await generateText({
      model: anthropic("claude-opus-4-1-20250805"),
      system: systemPrompt,
      messages,
    });

    console.log("Got response from Claude, length:", result.text.length);

    return new Response(result.text, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(`Error: ${errorMessage}`, { status: 500 });
  }
}
