import { NextResponse } from "next/server";
import { getPost, updatePostVariant, savePost } from "@/lib/demo/store";

/** Independent per-tab edit — does not reset other channels */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = (await request.json()) as {
    connectedAccountId: string;
    caption?: string;
    mediaAssetIds?: string[];
    hashtags?: string[];
  };

  const updated = updatePostVariant(id, body.connectedAccountId, {
    caption: body.caption,
    mediaAssetIds: body.mediaAssetIds,
    hashtags: body.hashtags,
  });

  if (!updated) {
    return NextResponse.json({ error: "post_not_found" }, { status: 404 });
  }

  savePost(updated);
  return NextResponse.json({ post: updated });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const post = getPost(id);
  if (!post) {
    return NextResponse.json({ error: "post_not_found" }, { status: 404 });
  }
  return NextResponse.json({ post });
}
