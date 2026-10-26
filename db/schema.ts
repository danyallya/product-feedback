import {integer,sqliteTable,text,index,uniqueIndex} from "drizzle-orm/sqlite-core";
export const workspaces=sqliteTable("workspaces",{
 id:text("id").primaryKey(),
 name:text("name").notNull(),
 slug:text("slug").notNull().unique(),
 createdAt:integer("created_at",{mode:"timestamp"}).notNull()
});
export const ideas=sqliteTable("ideas",{
 id:text("id").primaryKey(),
 workspaceId:text("workspace_id").notNull().references(()=>workspaces.id,{onDelete:"cascade"}),
 title:text("title").notNull(),
 description:text("description").notNull(),
 category:text("category").notNull(),
 status:text("status").notNull().default("considering"),
 authorName:text("author_name").notNull(),
 createdAt:integer("created_at",{mode:"timestamp"}).notNull(),
 updatedAt:integer("updated_at",{mode:"timestamp"}).notNull()
},table=>[index("ideas_workspace_status_created").on(table.workspaceId,table.status,table.createdAt)]);
export const votes=sqliteTable("votes",{
 id:text("id").primaryKey(),
 ideaId:text("idea_id").notNull().references(()=>ideas.id,{onDelete:"cascade"}),
 voterKey:text("voter_key").notNull(),
 createdAt:integer("created_at",{mode:"timestamp"}).notNull()
},table=>[uniqueIndex("votes_idea_voter_unique").on(table.ideaId,table.voterKey),index("votes_idea_id").on(table.ideaId)]);
export const comments=sqliteTable("comments",{
 id:text("id").primaryKey(),
 ideaId:text("idea_id").notNull().references(()=>ideas.id,{onDelete:"cascade"}),
 authorName:text("author_name").notNull(),
 body:text("body").notNull(),
 createdAt:integer("created_at",{mode:"timestamp"}).notNull()
},table=>[index("comments_idea_created").on(table.ideaId,table.createdAt)]);