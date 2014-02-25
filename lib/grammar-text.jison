/* description: Parse text and blocks */

/* lexical grammar */
%lex
%%

(\\\{|\\\}|[^{}])+    return 'CONTENT';
"{{"                  return '{{'
"}}"                  return '}}'
"{{{"                 return '{{{'
"}}}"                 return '}}}'
<<EOF>>               return 'EOF'
.                     return 'INVALID'

/lex

%% /* language grammar */

pgm
  : template -> $$ = $template; return $template;
  ;

template
  : block template -> $$ = $block.concat($template);
  | content template -> $$ = $content.concat($template);
  | EOF -> $$ = []
  ;

content
  : CONTENT -> $$ = [{ type: 'content', value: $1 }];
  ;

block
  : '{{' CONTENT '}}' -> $$ = [{ type: 'block', statement: $CONTENT }];
  ;

// Currently not part of the grammar so parser errors are thrown
rawblock
  : '{{{' CONTENT '}}}' -> $$ = [{ type: 'rawblock', statement: $CONTENT }];
  ;
