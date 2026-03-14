import Database from 'better-sqlite3';
import { join } from 'path';

// Use process.cwd() to ensure we find the DB relative to the project root
const dbPath = join(process.cwd(), 'portfolio.db');
const db = new Database(dbPath);

export function getCareerMilestones() {
  return db.prepare('SELECT * FROM career_milestones ORDER BY year ASC').all().map(row => ({
    ...row,
    isSpecial: Boolean(row.is_special),
    isCurrent: Boolean(row.is_current)
  }));
}

export function getCaseStudies() {
  return db.prepare('SELECT * FROM case_studies').all().map(row => ({
    ...row,
    techStack: JSON.parse(row.tech_stack),
    starr: {
      situation: row.situation,
      task: row.task,
      action: row.action,
      result: row.result,
      reflection: row.reflection
    }
  }));
}

export function getProfessionalEngagements() {
  return db.prepare('SELECT * FROM professional_engagements').all();
}

export function getAdvisoryTiers() {
  return db.prepare('SELECT * FROM advisory_tiers').all().map(row => ({
    ...row,
    deliverables: JSON.parse(row.deliverables)
  }));
}

export default db;
