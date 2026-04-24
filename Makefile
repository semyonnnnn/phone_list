# Define the python executable
PYTHON = python3
VENV = venv

# Default command: setup everything
setup:
	$(PYTHON) -m venv $(VENV)
	./$(VENV)/bin/pip install -r utils/requirements.txt
	@echo "✅ Setup complete. Use 'source venv/bin/activate' to start."
# Shortcut for cleaning up
clean:
	rm -rf $(VENV)
	rm -rf __pycache__

run:
	@./utils/run.sh
dev:
	@./utils/server.sh