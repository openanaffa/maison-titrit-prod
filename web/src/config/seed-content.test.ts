import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "bun:test";
import { SEED_ARTICLES } from "./articles";
import { SEED_CAMPAIGN_DRAFTS } from "./seed-campaign";
import { CATEGORIES, PRODUCTS } from "./products";

const publicDir = resolve(import.meta.dir, "../../public");
const platforms = ["facebook", "instagram", "pinterest", "linkedin", "googleBusiness"] as const;

describe("Maison Titrit seed content", () => {
  test("contains exactly seven products in each requested category with resolving media", () => {
    expect(CATEGORIES.map((category) => category.name)).toEqual(["Modern", "Moroccan"]);
    expect(new Set(PRODUCTS.map((product) => product.ref)).size).toBe(14);

    for (const category of CATEGORIES) {
      expect(PRODUCTS.filter((product) => product.category === category.name)).toHaveLength(7);
    }

    for (const product of PRODUCTS) {
      expect(product.images.length).toBeGreaterThan(0);
      for (const image of product.images) {
        expect(existsSync(resolve(publicDir, image.url.slice(1)))).toBe(true);
      }
    }
  });

  test("has one distinct, linked Craft feature for every product and both editorial categories", () => {
    const features = SEED_ARTICLES.filter((article) => article.productRef);
    expect(SEED_ARTICLES).toHaveLength(PRODUCTS.length + 2);
    expect(features).toHaveLength(PRODUCTS.length);
    expect(new Set(features.map((article) => article.slug)).size).toBe(PRODUCTS.length);
    expect(new Set(features.map((article) => article.productRef)).size).toBe(PRODUCTS.length);

    for (const product of PRODUCTS) {
      const feature = features.find((article) => article.productRef === product.ref);
      expect(feature?.category).toBe("Craft");
      expect(feature?.body).toContain(`/produit/${product.ref}`);
    }

    for (const category of ["Maison", "Craft"]) {
      expect(SEED_ARTICLES.some((article) => article.category === category && !article.productRef)).toBe(true);
    }
    for (const article of SEED_ARTICLES) {
      expect(existsSync(resolve(publicDir, article.coverImage.slice(1)))).toBe(true);
      expect(article.tags[0]).toBe(article.category);
    }
  });

  test("prepares unpublished, platform-adapted drafts for products and editorials", () => {
    expect(SEED_CAMPAIGN_DRAFTS).toHaveLength(PRODUCTS.length * 2 + 2);
    expect(SEED_CAMPAIGN_DRAFTS.every((campaign) => campaign.status === "draft")).toBe(true);

    for (const campaign of SEED_CAMPAIGN_DRAFTS) {
      expect(existsSync(resolve(publicDir, campaign.image.slice(1)))).toBe(true);
      for (const platform of platforms) {
        const post = campaign.posts[platform];
        expect(post.title.length).toBeGreaterThan(0);
        expect(post.caption.length).toBeGreaterThan(0);
        expect(post.callToAction.length).toBeGreaterThan(0);
        expect(post.url.startsWith("/")).toBe(true);
        if (platform === "googleBusiness") expect(post.hashtags).toHaveLength(0);
        else expect(post.hashtags.length).toBeGreaterThan(0);
      }
    }

    const productCampaigns = SEED_CAMPAIGN_DRAFTS.filter((campaign) => campaign.kind === "product");
    expect(productCampaigns).toHaveLength(PRODUCTS.length);
    for (const campaign of productCampaigns) {
      expect(campaign.posts.linkedin.url).toBe(campaign.articlePath);
      expect(campaign.posts.instagram.url).toBe(campaign.productPath);
    }

    const articleCampaigns = SEED_CAMPAIGN_DRAFTS.filter((campaign) => campaign.kind === "product-article");
    expect(articleCampaigns).toHaveLength(PRODUCTS.length);
    expect(articleCampaigns.every((campaign) => platforms.every((platform) => campaign.posts[platform].url === campaign.articlePath))).toBe(true);
    expect(SEED_CAMPAIGN_DRAFTS.filter((campaign) => campaign.kind === "editorial")).toHaveLength(2);
  });
});
