import request from '../utils/request';

type params = {
  status?: number;
  offset: number;
  limit: number;
  beginDate: any;
  endDate: any;
};

export const getArticle = ({
  offset,
  limit,
  beginDate,

  endDate,
  status
}: params): Promise<ArticleDatatype[]> => {
  return request(
    `https://jsonplaceholder.typicode.com/posts?s=${status}&o=${offset}&l=${limit}&b=${beginDate}&e=${endDate}`
  );
};
