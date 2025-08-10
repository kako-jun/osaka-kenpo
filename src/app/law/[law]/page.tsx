import Link from 'next/link';
import fs from 'fs';
import path from 'path';

// 構造が分かっているJSONファイルから条文タイトルを読み込む関数
const getArticleTitle = (filePath: string): string => {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    // "title" フィールドに "第一条 天皇" のような形式で入っていると仮定
    return data.title || 'タイトル不明';
  } catch (error) {
    console.error(`Error reading or parsing file ${filePath}:`, error);
    return 'タイトル読み込みエラー';
  }
};


const ConstitutionPage = ({ params }: { params: { law: string } }) => {
  const lawNameMapping: { [key: string]: string } = {
    constitution: '日本国憲法',
    minpou: '民法',
    keihou: '刑法',
    shouhou: '商法',
  };

  const lawName = lawNameMapping[params.law] || '不明な法律';
  const articlesDirectory = path.join(process.cwd(), 'src', 'data', 'laws', 'jp', params.law);
  let articleFiles: string[] = [];

  try {
    articleFiles = fs.readdirSync(articlesDirectory)
      .filter(file => file.endsWith('.json'))
      .sort((a, b) => {
        const numA = parseInt(a.replace('.json', ''));
        const numB = parseInt(b.replace('.json', ''));
        return numA - numB;
      });
  } catch (error) {
    console.error(`Could not read articles directory for ${params.law}:`, error);
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">{lawName}</h1>
        <p className="text-red-500">条文データの読み込みに失敗しました。ディレクトリが存在しない可能性があります。</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center">{lawName}</h1>
      <div className="space-y-3">
        {articleFiles.map(fileName => {
          const articleId = fileName.replace('.json', '');
          const filePath = path.join(articlesDirectory, fileName);
          const title = getArticleTitle(filePath);

          return (
            <Link key={articleId} href={`/law/${params.law}/${articleId}`}>
              <div className="block p-4 bg-white rounded-lg shadow hover:bg-gray-100 cursor-pointer">
                <span className="font-bold text-[#E94E77]">{`第${articleId}条`}</span>
                <span className="ml-4 text-gray-800">{title.split(' ')[1] || ''}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ConstitutionPage;
