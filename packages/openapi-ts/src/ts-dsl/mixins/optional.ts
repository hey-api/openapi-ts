import ts from 'typescript';

export class OptionalMixin {
  protected isOptional?: boolean;
  protected questionToken?: ts.PunctuationToken<ts.SyntaxKind.QuestionToken>;

  optional<T extends this>(this: T, condition = true): T {
    if (condition) {
      this.isOptional = true;
      this.questionToken = ts.factory.createToken(ts.SyntaxKind.QuestionToken);
    }
    return this;
  }
}
