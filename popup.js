/**
 * DDL Transformer - 将SQL DDL语句转换为表格格式
 * 
 * 输出格式：
 * 第一行：表名
 * 之后每行：字段名\t字段类型\t字段注释
 */

// DOM 元素
const transformBtn = document.getElementById('transformBtn');
const copyBtn = document.getElementById('copyBtn');
const statusEl = document.getElementById('status');
const previewEl = document.getElementById('preview');
const previewContentEl = document.getElementById('previewContent');

// 存储转换结果
let transformedResult = '';

/**
 * 解析DDL语句，提取表名和字段信息
 * @param {string} ddl - DDL语句
 * @returns {object} - { tableName, fields: [{name, type, comment}] }
 */
function parseDDL(ddl) {
  // 提取表名 - 支持多种格式
  // CREATE TABLE IF NOT EXISTS table_name
  // CREATE TABLE table_name
  const tableNameRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"]?(\w+)[`"]?\s*\(/i;
  const tableMatch = ddl.match(tableNameRegex);
  
  if (!tableMatch) {
    throw new Error('无法识别表名，请确保DDL格式正确');
  }
  
  const tableName = tableMatch[1];
  
  // 提取字段定义部分（括号内的内容）
  // 找到CREATE TABLE后的第一个括号对
  const startIndex = ddl.indexOf('(', tableMatch.index);
  if (startIndex === -1) {
    throw new Error('无法找到字段定义');
  }
  
  // 找到匹配的右括号（考虑嵌套括号的情况）
  let depth = 1;
  let endIndex = startIndex + 1;
  while (depth > 0 && endIndex < ddl.length) {
    if (ddl[endIndex] === '(') depth++;
    if (ddl[endIndex] === ')') depth--;
    endIndex++;
  }
  
  const fieldsContent = ddl.substring(startIndex + 1, endIndex - 1);
  
  // 解析每个字段
  const fields = [];
  
  // 按行或逗号分割字段定义
  const lines = fieldsContent.split(/\n|,(?![^()]*\))/);
  
  for (let line of lines) {
    // 清理空白字符
    line = line.trim();
    
    // 跳过空行和非字段定义行（如PRIMARY KEY, INDEX等）
    if (!line || 
        /^(PRIMARY\s+KEY|KEY|INDEX|UNIQUE|CONSTRAINT|FOREIGN\s+KEY|PARTITIONED\s+BY)/i.test(line)) {
      continue;
    }
    
    // 解析字段：字段名 类型 [其他属性] [COMMENT '注释']
    // 支持反引号或不带引号的字段名
    const fieldRegex = /^[`"]?(\w+)[`"]?\s+(\w+(?:\s*\([^)]*\))?)\s*(?:.*?COMMENT\s+['"](.*?)['"])?/i;
    const fieldMatch = line.match(fieldRegex);
    
    if (fieldMatch) {
      const fieldName = fieldMatch[1];
      const fieldType = fieldMatch[2].toUpperCase();
      const fieldComment = fieldMatch[3] || '';
      
      // 排除一些关键字
      if (!['PRIMARY', 'KEY', 'INDEX', 'UNIQUE', 'CONSTRAINT', 'PARTITIONED'].includes(fieldName.toUpperCase())) {
        fields.push({
          name: fieldName,
          type: fieldType,
          comment: fieldComment
        });
      }
    }
  }
  
  if (fields.length === 0) {
    throw new Error('未能解析出任何字段信息');
  }
  
  return { tableName, fields };
}

/**
 * 将解析结果转换为指定格式的字符串
 * @param {object} parsed - 解析结果
 * @returns {string} - 格式化的结果
 */
function formatResult(parsed) {
  const lines = [];
  
  // 第一行：表名
  lines.push(parsed.tableName);
  
  // 之后每行：字段名\t字段类型\t字段注释
  for (const field of parsed.fields) {
    lines.push(`${field.name}\t${field.type}\t${field.comment}`);
  }
  
  return lines.join('\n');
}

/**
 * 显示状态消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型 ('success' 或 'error')
 */
function showStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
}

/**
 * 隐藏状态消息
 */
function hideStatus() {
  statusEl.className = 'status';
}

/**
 * 显示预览
 * @param {string} content - 预览内容
 */
function showPreview(content) {
  previewContentEl.textContent = content;
  previewEl.classList.add('show');
  copyBtn.style.display = 'block';
}

/**
 * 隐藏预览
 */
function hidePreview() {
  previewEl.classList.remove('show');
  copyBtn.style.display = 'none';
}

/**
 * 从剪贴板读取内容
 * @returns {Promise<string>}
 */
async function readClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    return text;
  } catch (err) {
    throw new Error('无法读取剪贴板，请确保已授权剪贴板访问权限');
  }
}

/**
 * 写入内容到剪贴板
 * @param {string} text - 要写入的内容
 */
async function writeClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    throw new Error('无法写入剪贴板');
  }
}

/**
 * 主转换函数
 */
async function transform() {
  hideStatus();
  hidePreview();
  transformedResult = '';
  
  try {
    // 1. 读取剪贴板
    const ddl = await readClipboard();
    
    if (!ddl || !ddl.trim()) {
      throw new Error('剪贴板为空，请先复制DDL语句');
    }
    
    // 2. 解析DDL
    const parsed = parseDDL(ddl);
    
    // 3. 格式化结果
    transformedResult = formatResult(parsed);
    
    // 4. 写入剪贴板
    await writeClipboard(transformedResult);
    
    // 5. 显示成功状态和预览
    showStatus(`✅ 转换成功！已复制到剪贴板（表名: ${parsed.tableName}，${parsed.fields.length} 个字段）`, 'success');
    showPreview(transformedResult);
    
  } catch (err) {
    showStatus(`❌ ${err.message}`, 'error');
  }
}

/**
 * 复制结果到剪贴板
 */
async function copyResult() {
  if (!transformedResult) {
    showStatus('❌ 没有可复制的结果', 'error');
    return;
  }
  
  try {
    await writeClipboard(transformedResult);
    showStatus('✅ 已复制到剪贴板', 'success');
  } catch (err) {
    showStatus(`❌ ${err.message}`, 'error');
  }
}

// 绑定事件
transformBtn.addEventListener('click', transform);
copyBtn.addEventListener('click', copyResult);
