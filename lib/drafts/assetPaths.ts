export function draftAssetPath(path: string) {
  return path
    .replace(/^\/static\/images\/posts\/([^/]+)\//, '/drafts/assets/$1/images/')
    .replace(/^\/demos\/posts\/([^/]+)\//, '/drafts/assets/$1/demos/')
}
