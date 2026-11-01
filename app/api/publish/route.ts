import { NextResponse } from "next/server";
import { publishPostWorkflow } from "@/workflows/publish-post";
import {
  demoAccounts,
  getPost,
  savePost,
} from "@/lib/demo/store";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    postId: string;
    device?: "mobile" | "desktop";
  };

  const post = getPost(body.postId);
  if (!post) {
    return NextResponse.json({ error: "post_not_found" }, { status: 404 });
  }

  const results = await publishPostWorkflow({
    post,
    accounts: demoAccounts,
    device: body.device ?? "mobile",
  });

  post.publicationPlan = post.publicationPlan.map((p) => {
    const r = results.find((x) => x.connectedAccountId === p.connectedAccountId);
    if (!r) return p;
    return {
      ...p,
      mode: r.mode,
      status: r.status,
      remotePostId: r.remotePostId,
    };
  });
  savePost(post);

  return NextResponse.json({ results, post });
}
