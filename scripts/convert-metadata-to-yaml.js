const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const dataDir = path.join(process.cwd(), 'src/data')

// 全てのJSONファイルを見つける関数
function findAllJsonFiles(dir, pattern = /\.json$/) {
  const files = []
  const items = fs.readdirSync(dir, { withFileTypes: true })
  
  for (const item of items) {
    const itemPath = path.join(dir, item.name)
    if (item.isDirectory()) {
      files.push(...findAllJsonFiles(itemPath, pattern))
    } else if (item.isFile() && pattern.test(item.name)) {
      files.push(itemPath)
    }
  }
  
  return files
}

// JSONファイルをYAMLに変換する関数
function convertJsonToYaml(jsonPath) {
  try {
    console.log(`変換中: ${jsonPath}`)
    
    // JSONファイルを読み込み
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8')
    const data = JSON.parse(jsonContent)
    
    // YAMLファイルパスを決定
    const yamlPath = jsonPath.replace(/\.json$/, '.yaml')
    
    // YAMLとして保存
    const yamlContent = yaml.dump(data, {
      indent: 2,
      lineWidth: 120,
      noRefs: true,
      sortKeys: false
    })
    
    fs.writeFileSync(yamlPath, yamlContent, 'utf-8')
    
    console.log(`✓ 変換完了: ${yamlPath}`)
    
    return { original: jsonPath, converted: yamlPath, success: true }
  } catch (error) {
    console.error(`✗ 変換失敗: ${jsonPath}`, error.message)
    return { original: jsonPath, converted: null, success: false, error: error.message }
  }
}

// メイン変換処理
function main() {
  console.log('メタデータファイルのYAML変換を開始します...\n')
  
  // 全てのJSONファイルを見つける（条文YAMLファイルは除外）
  const allJsonFiles = findAllJsonFiles(dataDir)
  
  // 条文データファイルを除外（既にYAMLに変換済み）
  const metadataJsonFiles = allJsonFiles.filter(file => {
    const relativePath = path.relative(dataDir, file)
    return !(/\/\d+\.json$/.test(relativePath)) // 数字.jsonファイルを除外
  })
  
  console.log(`対象ファイル数: ${metadataJsonFiles.length}`)
  console.log('対象ファイル:')
  metadataJsonFiles.forEach(file => {
    console.log(`  ${path.relative(process.cwd(), file)}`)
  })
  console.log('')
  
  const results = []
  
  // 各JSONファイルを変換
  for (const jsonFile of metadataJsonFiles) {
    const result = convertJsonToYaml(jsonFile)
    results.push(result)
  }
  
  // 結果をまとめる
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  
  console.log('\n=== 変換結果 ===')
  console.log(`成功: ${successful.length}`)
  console.log(`失敗: ${failed.length}`)
  
  if (failed.length > 0) {
    console.log('\n失敗したファイル:')
    failed.forEach(f => {
      console.log(`  ${f.original}: ${f.error}`)
    })
  }
  
  if (successful.length > 0) {
    console.log('\n変換されたファイル:')
    successful.forEach(s => {
      console.log(`  ${path.relative(process.cwd(), s.converted)}`)
    })
    
    console.log('\n※ 変換後、元のJSONファイルは手動で削除してください')
  }
  
  console.log('\n変換処理が完了しました。')
}

if (require.main === module) {
  main()
}