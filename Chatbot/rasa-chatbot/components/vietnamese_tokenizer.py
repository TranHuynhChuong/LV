from typing import List, Text, Dict, Any
from rasa.engine.graph import ExecutionContext
from rasa.engine.storage.resource import Resource
from rasa.engine.storage.storage import ModelStorage
from rasa.engine.recipes.default_recipe import DefaultV1Recipe

from rasa.shared.nlu.training_data.message import Message
from rasa.nlu.tokenizers.tokenizer import Tokenizer, Token
from rasa.nlu.constants import TOKENS_NAMES

from underthesea import word_tokenize


@DefaultV1Recipe.register(
    [DefaultV1Recipe.ComponentType.MESSAGE_TOKENIZER], is_trainable=False
)
class VietnameseTokenizer(Tokenizer):
    """Custom Vietnamese tokenizer using underthesea."""

    @staticmethod
    def get_default_config() -> Dict[Text, Any]:
        return {
            "intent_tokenization_flag": False,
            "intent_split_symbol": "_",
            "case_sensitive": True,
        }

    def __init__(self, config: Dict[Text, Any]) -> None:
        super().__init__(config)
        self.case_sensitive = config.get("case_sensitive", True)

    @classmethod
    def create(
        cls,
        config: Dict[Text, Any],
        model_storage: ModelStorage,
        resource: Resource,
        execution_context: ExecutionContext,
    ) -> "VietnameseTokenizer":
        return cls(config)

    def tokenize(self, message: Message, attribute: Text) -> List[Token]:
        text = message.get(attribute)

        # Normalize Unicode (optional but helps with consistency)
        import unicodedata
        text = unicodedata.normalize("NFC", text)

        # Use Underthesea with format="list" to avoid underscores
        words = word_tokenize(text, format="list")

        tokens = self._convert_words_to_tokens(words, text)

        message.set(TOKENS_NAMES[attribute], tokens)
        return tokens
