import Database from 'better-sqlite3';
import { join } from 'path';

// Use process.cwd() to ensure we find the DB relative to the project root
const dbPath = join(process.cwd(), 'portfolio.db');
const db = new Database(dbPath);

export function getCareerMilestones() {
  return db.prepare('SELECT * FROM career_milestones ORDER BY x ASC').all().map(row => ({
    ...row,
    isSpecial: Boolean(row.is_special),
    isCurrent: Boolean(row.is_current)
  }));
}

export function getCaseStudies() {
  return db.prepare('SELECT * FROM case_studies ORDER BY display_order ASC').all().map(row => ({
    ...row,
    techStack: row.tech_stack ? JSON.parse(row.tech_stack) : [],
    categories: row.categories ? JSON.parse(row.categories) : [],
    description: row.subtitle,
    tier: row.tier,
    displayOrder: row.display_order,
    industry: row.industry,
    relatedTool: row.related_tool ?? null,
    relatedBuild: row.related_build ?? null,
    relatedCase: row.related_case ?? null,
    snippetIds: row.snippet_ids ? JSON.parse(row.snippet_ids) : [],
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
  return db.prepare('SELECT * FROM professional_engagements ORDER BY display_order ASC').all().map(row => ({
    ...row,
    categories: row.categories ? JSON.parse(row.categories) : [],
  }));
}

export function getAdvisoryTiers() {
  return db.prepare('SELECT * FROM advisory_tiers ORDER BY display_order ASC').all().map(row => ({
    ...row,
    deliverables: JSON.parse(row.deliverables),
    idealFor: row.ideal_for,
  }));
}

export function getCategoryMeta() {
  return db.prepare('SELECT * FROM category_meta ORDER BY id ASC').all();
}

export function categorySlug(name) {
  const match = db.prepare('SELECT slug FROM category_meta WHERE name = ?').get(name);
  return match ? match.slug : name.toLowerCase().replace(/\s+/g, '-');
}

export default db;
