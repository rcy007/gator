import { eq } from "drizzle-orm";
import { db } from "..";
import { feeds, users } from "../schema";

export async function createUser(name: string) {
  const [result] = await db.insert(users).values({ name: name }).returning();
  return result;
}

export async function getUser(name: string) {
    const [result] = await db.select().from(users).where(eq(users.name, name));
    return result;
}

export async function truncUser(){
    const [result] = await db.delete(users);
    return result;
}

export async function getUsers() {
    const result = await db.select().from(users);
    return result;
}

export async function createFeed(user: string, name: string, url: string) {
  const [result] = await db.insert(feeds).values({ userId: user, name: name, url: url }).returning();
  return result;
}