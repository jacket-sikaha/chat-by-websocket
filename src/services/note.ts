import request from '../utils/request';

console.log(import.meta.env.BASE_URL);
export const getNotes = (page: number, pageSize = 10): Promise<{ result: NoteDatatype[] }> => {
  return request(`/api/note/get/notes/${page}/${pageSize}`);
};
