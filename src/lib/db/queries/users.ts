import { eq, sql, getTableColumns } from "drizzle-orm";
import { db } from "..";
import { feed_follows, feeds, users } from "../schema";
import { readConfig } from "src/config";

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

export async function getFeeds(){
    const result = await db.select({
        name: feeds.name,
        url: feeds.url,
        userName: users.name
    }).from(feeds).innerJoin(users, eq(feeds.userId, users.id))
    return result;
}

export async function createFeedFollow(url: string){
    const config = readConfig();
    const user = await getUser(config.currentUserName);
    const [feed] = await db.select({id: feeds.id}).from(feeds).where(eq(feeds.url, url));
    const [result] = await db.insert(feed_follows).values({userId: user.id, feedId: feed.id}).returning();
    const [output] = await db.select({
        ...getTableColumns(feed_follows),
        feedName: feeds.name,
        userName: users.name
    }).from(feed_follows).where(eq(feed_follows.id, result.id)).innerJoin(
        users, eq(feed_follows.userId, users.id)).innerJoin(
            feeds, eq(feed_follows.feedId, feeds.id)
        );
    return output;
}

export async function getFeedFollowsForUser(){
    const config = readConfig();
    const user = await getUser(config.currentUserName);
    const result = await db.select({
        userName: users.name,
        feedName: feeds.name
    }).from(users).where(eq(users.id, user.id)).innerJoin(feed_follows, eq(feed_follows.userId, users.id)).innerJoin(
        feeds, eq(feeds.id, feed_follows.feedId)
    );
    return result;
}