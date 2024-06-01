declare interface NoteDatatype {
  id: number;
  userId: number;
  username: string;
  userAvatar: string;
  title: string;
  content: string;
  images: string;
  location: string;
  feeling: string;
  likes: number;
  comments: number;
  collections: number;
  status: number;
  createTime: string;
}
declare interface UserMsgDatatype {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  introduction: string;
  sex: string;
  ip: string;
  follows: number;
  fans: number;
  likes: number;
}

declare interface ArticleDatatype {
  id: number;
  userId: number;
  title: string;
  body: string;
}
