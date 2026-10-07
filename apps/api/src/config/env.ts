import { z } from "zod";

// Le "contrat" de configuration de l'API
export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),           // On force le type de la variable à number, si la valeur est absente, on prend la valeur par défaut(3000)
  DATABASE_URL: z.string().startsWith("postgresql://", "doit commencer par postgresql://"),
  REDIS_URL: z.string().startsWith("redis://", "doit commencer par redis://"),
  SESSION_SECRET: z.string().min(32, "doit faire au moins 32 caractères"),
});

export type Env = z.infer<typeof envSchema>;

// Appelée par NestJS au démarrage : lève une erreur si la config est invalide
export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")} : ${issue.message}`)
      .join("\n");
    throw new Error(`Configuration invalide :\n${details}`);
  }

  return result.data;
}