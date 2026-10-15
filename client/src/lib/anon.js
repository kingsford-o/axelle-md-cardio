export function getAnonId() {
  let id = localStorage.getItem("kyh_anon_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("kyh_anon_id", id);
  }
  return id;
}