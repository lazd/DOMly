/* description: Parse text and blocks */

/* lexical grammar */
%lex
%%

([^{}\\])+            return 'CONTENT';
"\\{"                 return 'ESCAPED_LEFT';
"\\}"                 return 'ESCAPED_RIGHT';
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
  : ESCAPED_LEFT -> $$ = [{ type: 'content', value: '{' }];
  | ESCAPED_RIGHT -> $$ = [{ type: 'content', value: '}' }];
  | CONTENT -> $$ = [{ type: 'content', value: $1 }];
  ;

block
  : '{{' CONTENT '}}' -> $$ = [{ type: 'block', statement: $CONTENT }];
  ;

// Currently not part of the grammar so parser errors are thrown
rawblock
  : '{{{' CONTENT '}}}' -> $$ = [{ type: 'rawblock', statement: $CONTENT }];
  ;
